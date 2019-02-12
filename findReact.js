function findReactInstance(node) {
    var internalInstance = null;
    for (var key in node) {
        if (key.startsWith("__reactInternalInstance$")) {
            internalInstance = node[key];
            break;
        }
    }
    
    if (!internalInstance) return null;

    if (internalInstance.return) { // react 16+
        return internalInstance._debugOwner
            ? internalInstance._debugOwner.stateNode
            : internalInstance.return.stateNode;
    } else { // react <16
        return internalInstance._currentElement._owner._instance;
    }
}

function findNearestReactInstance(node, skipSelf) {
    var target = node;
    if (skipSelf) target = node.parentNode;
    var instance = null;
    while (target && !instance) {
        instance = findReactInstance(target);
        target = target.parentNode;
    }
    return instance;
}

window.$r = findReactInstance;
window.$rup = findNearestReactInstance;
