/*
Dead simplistic implementation of a DI container
Does the job and supports to pass in extra arguments when making a concrete class

Possible improvements:
- Support singletons for classes
- Support functions (and their returned value as singletons/cache too!)
*/
class DependencyInjectionContainer {
    constructor() {
        this.dependencies = {};
    }
    
    setValue(key, value) {
        this.dependencies[key] = {
            type: 'value',
            value,
        };
    }
    
    setClass(key, value) {
        this.dependencies[key] = {
            type: 'class',
            value,
        };
    }

    get(key, options) {
        const concrete = this.dependencies[key];
        if (!concrete) {
            return null;
        }
        // Gives us the power to give out a container object to class constructors in the form of an object on which to call getters
        // Works much like __getattr__ in python
        const contextualizedContainerProxy = new Proxy({}, {
            get: (_proxy, prop) => this.get(prop, options)
        });
        switch (concrete.type) {
            case 'class':
                return new concrete.value(contextualizedContainerProxy, options || {});
            case 'value':
                return concrete.value;
        }
    }
}

module.exports = DependencyInjectionContainer;