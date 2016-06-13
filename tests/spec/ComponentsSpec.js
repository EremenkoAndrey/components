describe("Component", function() {
    var fixture = setFixtures('<div data-component="FirstComponent"><a data-click="test" href="#"><span><b data-click="test"></b></span></a></div>');

    var FirstComponent = Component.create('FirstTestComponent', {
        init: function () {
        },
        test: function () {
            console.log('test');
        }
    });

    var SecondComponent = Component.create('SecondTestComponent', {
        test2: function () {}
    });

    var firstInstance = new FirstComponent(fixture, {});
    var secondInstance = new SecondComponent($('<div></div>'), {});

    describe("Component.create создает новые классы", function() {

        it("Component.create создает функцию", function() {
            expect(typeof FirstComponent === 'function').toBe(true);
        });
        it("Новая функция - это класс, создающий объекты", function() {
            expect(typeof firstInstance === 'object').toBe(true);
        });
        it("Переданные методы становятся методами экземпляров класса", function() {
            expect(FirstComponent.prototype.test).toBeDefined();
            expect(firstInstance.test).toBeDefined();
            expect(typeof firstInstance.test === 'function').toBeDefined();
        });
        it("Классы имеют разные прототипы...", function() {
            expect(FirstComponent.prototype === SecondComponent.prototype).toBe(false);
        });
        it("...но общий объект-конструктор", function() {
            expect(FirstComponent.prototype.constructor).toBeDefined();
            expect(FirstComponent.prototype.constructor === SecondComponent.prototype.constructor).toBe(true);
        });
    });

    it("Component.init() определен и наследуется экземплярами", function() {
        expect(Component.init).toBeDefined();
        expect(firstInstance.init).toBeDefined();
    });

    describe("Биндинг событий", function() {
        beforeEach(function() {
           firstInstance.bindingEvent('click');
        });

        it("Component.dataEvent() вложенные элементы с data-click срабатывают: два вложенных элемента вызовут событие два раза", function() {
            spyOn(firstInstance, 'test');
            $('b', fixture).trigger('click');
            expect(firstInstance.test).toHaveBeenCalledTimes(2);
        });

        it("Component.bindingEvent() вешает переданное в аргументе событие на корневой элемент, вызывая по нему dataEvent()", function() {
            spyOn(firstInstance, 'dataEvent');
            fixture.trigger('click');
            expect(firstInstance.dataEvent).toHaveBeenCalled();
        });

        it("Component.dataEvent() при клике на элементе вызывает метод, записанный в data-click", function() {
            spyOn(firstInstance, 'test');
            $('a', fixture).trigger('click');
            expect(firstInstance.test).toHaveBeenCalled();
        });

        it("Component.dataEvent() при клике на вложенном элементе вызывает метод, записанный в data-click родителя", function() {
            spyOn(firstInstance, 'test');
            $('span', fixture).trigger('click');
            expect(firstInstance.test).toHaveBeenCalled();
        });
    });

    describe("Overlay", function() {
        it("showOverlay() создает элемент с классом .overlay", function() {
            firstInstance.showOverlay();
            expect($('.overlay')[0]).toBeInDOM()
        });
        it("Использование showOverlay() другим компонентом (или повторное использование) не создает второй элемент с классом .overlay", function() {
            secondInstance.showOverlay();
            secondInstance.showOverlay();
            expect($('.overlay').length === 1).toBe(true);
        });
    });


});

