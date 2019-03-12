const fs = require("fs");
const path = require("path");
const util = require("util");
const _exec = util.promisify(require("child_process").exec);

const bindExecContext = cwd => {
  return cmd => _exec(cmd, { cwd });
};

const convertToCsvText = refList => {
  const csvHeaderLine = `ref,hash,branchName,date,author,isBranchTip,isFeature,isBugfix,isTagged,tags\n`;
  return refList.reduce((txt, refItem) => {
    const { ref, hash, shortRef, ts, author, isBranchTip, isFeature, isBugfix, isTagged, tags } = refItem;
    const tagsStr = tags ? tags.join(", ") : "";
    const dateStr = ts.toISOString().substr(0, 10);
    const line = `${ref},${hash},${shortRef},${dateStr},"${author}",${isBranchTip},${isFeature},${isBugfix},${isTagged},"${tagsStr}"\n`;
    return txt + line;
  }, csvHeaderLine);
};

async function getOriginRefList(GIT_REPO_PATH) {
  const exec = bindExecContext(GIT_REPO_PATH || process.cwd());

  // Print all remotes/origin refs, sorted by "committerdate" latest to oldest
  const CMD_LIST_ORIGIN_REFS = `git --no-pager branch -r --sort=-committerdate --format='%(objectname) %(refname)'`;
  const { stdout: originRefText } = await exec(CMD_LIST_ORIGIN_REFS);

  /**
   * `originRefText` line example:
   * "95da93d0ba6b2e2ef2b1b9baaf5db69d163baac0 refs/remotes/origin/develop"
   * @type {Array<{ ref: string, hash: string, shortRef: string, ts: Date, author: string, isBranchTip: boolean, isFeature: boolean, isBugfix: boolean, isTagged: boolean, tags?: string[]}>}
   */
  const originRefList = originRefText
    .trim()
    .split("\n")
    .map(line => {
      // ATTENTION! ONE hash can have MULTIPLE refs!
      const [hash, ref] = line.split(" ");
      return { ref, hash };
    });

  // create a map: Map<string, string[]> of hash => [tag, tag]
  // for tracking tagged branches.
  const CMD_LIST_TAGS = `git show-ref --tags`;
  const { stdout: tagsText } = await exec(CMD_LIST_TAGS);
  const hash2TagsMap = tagsText
    .trim()
    .split("\n")
    .reduce((map, line) => {
      const [hash, tagFullRef] = line.split(" ");
      const tagRef = tagFullRef.replace("refs/tags/", "");
      const tagsList = map.has(hash) ? map.get(hash) : [];
      tagsList.push(tagRef);
      map.set(hash, tagsList);
      return map;
    }, new Map());

  await Promise.all(
    originRefList.map(async originRef => {
      const fullRef = originRef.ref;
      const shortRef = fullRef.replace("refs/remotes/origin/", "");
      originRef.shortRef = shortRef;
      originRef.isFeature = shortRef.startsWith("feat");
      originRef.isBugfix = shortRef.startsWith("bug");

      const CMD_FIND_CHILDREN_HASH = `git --no-pager branch -r --sort=-committerdate --contains ${fullRef} --format='%(objectname)'`;
      const CMD_GET_METADATA_OF_REF = `git --no-pager log -1 --format='%aN<%ae>|%aI' ${fullRef}`;

      const [childrenHashText, metadataText] = await Promise.all([
        exec(CMD_FIND_CHILDREN_HASH).then(v => v.stdout),
        exec(CMD_GET_METADATA_OF_REF).then(v => v.stdout)
      ]);

      // if the set of all branches that CONTAINS a specific branch-ref-A only has one element -- itself,
      // that mean branch-ref-A is at the "branch tip", in other words, it not merged into any other branch.
      const uniqHashSet = new Set(childrenHashText.trim().split("\n"));
      if (uniqHashSet.size === 1) {
        originRef.isBranchTip = true;
      } else {
        originRef.isBranchTip = false;
      }

      // extra metadata added to item
      const [author, ISO8601Timestamp] = metadataText.trim().split("|");
      originRef.author = author;
      originRef.ts = new Date(ISO8601Timestamp);
      originRef.isTagged = hash2TagsMap.has(originRef.hash);
      if (originRef.isTagged) {
        originRef.tags = hash2TagsMap.get(originRef.hash).slice();
      }
    })
  );

  return originRefList;
}

function generateGitCmdToRemove(removables) {
  const remoteRefs = removables.map(item => item.shortRef).join(" ");
  return `git push origin --delete ${remoteRefs}`;
}

async function main(options) {
  const repoPath = path.resolve(process.cwd(), process.argv[2]);
  const originRefList = await getOriginRefList(repoPath);
  const csv = convertToCsvText(originRefList);

  const repoName = repoPath.split("/").pop();
  const csvDest = path.resolve(process.cwd(), `${repoName}_remote_branches_status.csv`);

  const rule = "=".repeat(csvDest.length + 4);

  console.log(
    `${rule}

1. A CSV report has been generated here:

   ${csvDest}
`
  );

  fs.writeFileSync(csvDest, csv);

  // now finally we filter and find removable branches:
  const afterDate = options.afterDate;
  const authorNamePatterns = options.authorNamePatterns;
  const matchAuthor = author => {
    author = author.toLowerCase();
    return authorNamePatterns.reduce((matched, pattern) => {
      if (matched) return true;
      return author.includes(pattern);
    }, false);
  };

  const removables = originRefList.filter(item => {
    if (item.isBranchTip) return false;
    if (item.isTagged) return false;
    if (!item.isFeature && !item.isBugfix) return false;

    if (authorNamePatterns && !matchAuthor(item.author)) return false;
    if (afterDate && item.ts - afterDate < 0) return false;

    return true;
  });

  const gitCmd = generateGitCmdToRemove(removables);
  console.log(`
2. Below is the command to delete ${removables.length} remote branches: 

   cd ${repoPath}
   ${gitCmd}

${rule}`);
}

// Fill in yours:
const options = {
  afterDate: new Date("2018-12-21"),
  authorNamePatterns: undefined
};
main(options);
