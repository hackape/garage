window.FindReact = function(node) {
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
