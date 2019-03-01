var eventInsight = (function() {
  const nsp = '[EventInsight] ';
  function walk(node, onEnterNode) {
    onEnterNode(node);
    var node = node.firstChild;
    while (node) {
        walk(node, onEnterNode);
        node = node.nextSibling;
    }
  }

  function getIndex(node) {
    var i = 0;
    while( (node = node.previousSibling) != null ) {
      i++;
    }
    return i;
  }

  function getPath(node) {
    const paths = [];
    while (node) {
      if (node === document.body) {
        paths.push('/html/body');
        break;
      }
      let tagName = node.tagName.toLowerCase();
      if (node.parentNode && node.parentNode.childElementCount === 1) {
        paths.push(tagName);
      } else {
        tagName += '[' + getIndex(node) + ']';
        paths.push(tagName);
      }
      node = node.parentNode;
    }
    paths.reverse();
    return paths.join('/');
  }

  function serialize(records) {
    var serialized = {}
    for (var r of records) {
      const [node, listeners] = r;
      const listenersSerialized = {};
      for (var eventType in listeners) {
        listenersSerialized[eventType] = listeners[eventType].map(item => item.listener.toString());
      }
      const id = getPath(node);
      serialized[id] = {
        node,
        listeners: listenersSerialized
      };
    }
    return serialized;
  }

  function getSnapshotOfDomEventListeners() {
    const snapshot = new Map();
    walk(document.body, function (node) {
      if (node instanceof EventTarget) {
        // `getEventListeners()` only exists in ChromeDevTool
        const eventListeners = getEventListeners(node)
        for (let key in eventListeners) {
          snapshot.set(node, eventListeners)
          break;
        }
      }
    });

    return snapshot;
  }

  var __snapshot__;
  function eventInsight(query, dbMap) {
    if (!__snapshot__) __snapshot__ = getSnapshotOfDomEventListeners();
    if (!dbMap) dbMap = __snapshot__;
    
    const db = Array.from(dbMap.entries())
    if (typeof query === 'string') {
      // case EVENT_TYPE
      return findByEventType(db, query);
    } else if (typeof query === 'function'){
      // case EVENT_LISTENER
      return findByListener(db, query);
    } else if (query instanceof HTMLElement) {
      // case NODE
      const result = new Map();
      if (dbMap.has(query)) {
        result.set(query, dbMap.get(query))
      }
      return result;
    } else if (typeof query === 'object' && query['event'] && query['node']) {
      // case QUERY: { node, event }
      const { event, node } = query;

      // check for event first;
      const result = findByEventType(db, event);
      
      if (result.size === 0) {
        return new Map();
      }
      let found;
      if (result.has(node)) {
        found = node;
        console.log(nsp + 'Exact match found!')
      } else {
        console.log(nsp + 'No exact match found, try find within nearest 10 parent nodes.')
        let iter = 0;
        let target = node.parentNode;
        while (target && iter < 10) {
          iter++;
          if (result.has(target)) {
            found = target;
            break;
          }
          target = node.parentNode;
        }
      }

      const narrowDownResult = new Map();
      if (found) {
        narrowDownResult.set(node, result.get(found));
      }

      return narrowDownResult;
    }

    console.log(nsp + 'Invalid query', query);
    return null;
  }

  function findByEventType(db, query) {
    const result = new Map();
    db.forEach(([node, listenersMap]) => {
      if (listenersMap.hasOwnProperty(query)) {
        result.set(node, listenersMap)
      }
    })
    return result;
  }

  function findByListener(db, query) {
    const result = new Map();
    db.forEach(([node, listenersMap]) => {
      const listenersMapEntry = Object.entries(listenersMap)
      const resultListenersMap = {}
      listenersMapEntry.forEach(([eventType, listeners]) => {
        if (listeners.indexOf(query) > -1) {
          if (listeners.indexOf(query)) {
            resultListenersMap[eventType] = [query]
          }
        }
      })
      result.set(node, resultListenersMap);
    });
    return result;
  }

  return { find: eventInsight, getSnapshot: getSnapshotOfDomEventListeners }
})();
