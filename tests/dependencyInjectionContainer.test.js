const { expect } = require("@jest/globals");
const DependencyInjectionContainer = require("../src/container/dependencyInjectionContainer");

class TestInjection {
    constructor(container) {
        this.injectedValue = container.injectedValue;
    }
}

test('The injected class uses an injectable value in the constructor', () => {
    const container = new DependencyInjectionContainer();
    container.setValue('injectedValue', 42);
    container.setClass('Test', TestInjection);

    const testInjectionInstance = container.get('Test');

    expect(testInjectionInstance.injectedValue).toBe(42);
});
