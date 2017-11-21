var BANNED_PASSWORDS = [];
var REQUIRE_STRONG = false;

function strength (password, username, fullname) {
    function isPasswordSameAsName(passwordValue, name) {
        return name && passwordValue.toLowerCase() === ("" + name).toLowerCase()
    }

    function tooObvious() {
        return {
            score: 0,
            message: Object(o.default)("Too Obvious"),
            reason: "obvious"
        }
    }

    function pruneRepeatSequence(repeatSeqLen, str) {
        for (var acc = "", charIndex = 0; charIndex < str.length; charIndex++) {
            var isRepeat = true, cursor = undefined;
            for (cursor = 0; cursor < repeatSeqLen && cursor + charIndex + repeatSeqLen < str.length; cursor++) {
                isRepeat = isRepeat && str.charAt(charIndex + cursor) === str.charAt(charIndex + cursor + repeatSeqLen);
            }

            if (cursor < repeatSeqLen) { isRepeat = false }
            if (isRepeat) {
                charIndex += repeatSeqLen - 1
                isRepeat = false
            } else {
                acc += str.charAt(charIndex)
            }
        }
        return acc
    }

    if (isPasswordSameAsName(password, username)) return tooObvious();
    if (isPasswordSameAsName(password, fullname)) return tooObvious();
    if (BANNED_PASSWORDS.indexOf(password.toLowerCase()) > -1) return tooObvious();

    if (REQUIRE_STRONG) {
        var c = "# ` ~ ! @ $ % ^ & * ( ) - _ = + [ ] { } \\ | ; : ' \" , . < > / ?".split(" ");
        c = c.map(function (e) {
            return "\\" + e
        }).join("");
        var l = ["\\d", "[a-z]", "[A-Z]", "[" + c + "]"],
            d = l.map(function (e) {
                return "(?=.*" + e + ")"
            }).join("");
        if (!password.match(new RegExp("(" + d + "){10,}"))) return {
            score: 0,
            message: Object(o.default)("Too Weak"),
            reason: "tooweak"
        }
    }

    var score = 0;
    score += 4 * password.length,
    score += 1 * (pruneRepeatSequence(1, password).length - password.length),
    score += 1 * (pruneRepeatSequence(2, password).length - password.length),
    score += 1 * (pruneRepeatSequence(3, password).length - password.length),
    score += 1 * (pruneRepeatSequence(4, password).length - password.length),
    password.match(/(.*[0-9].*[0-9].*[0-9])/) && (score += 5),
    password.match(/(.*[!@#$%^&*?_~].*[!@#$%^&*?_~])/) && (score += 5),
    password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/) && (score += 10),
    password.match(/([a-zA-Z])/) && password.match(/([0-9])/) && (score += 15),
    password.match(/([!@#$%^&*?_~])/) && password.match(/([0-9])/) && (score += 15),
    password.match(/([!@#$%^&*?_~])/) && password.match(/([a-zA-Z])/) && (score += 15),
    (password.match(/^\w+$/) || password.match(/^\d+$/)) && (score -= 10),
    score < 0 && (score = 0),
    score > 100 && (score = 100);

    return score < 34 ? {
        score: score,
        message: "weak",
    } : score < 50 ? {
        score: score,
        message: "good",
    } : score < 75 ? {
        score: score,
        message: "strong",
    } : {
        score: score,
        message: "verystrong",
    }
}
