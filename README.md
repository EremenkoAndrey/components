
### Назначение
Библиотека создана для:
- уменьшения связанности отдельных скриптов друг с другом;
- устранения привязки js-кода к css-классам в том числе при биндинге DOM-событий;
- создания системы автоматической инициализации скриптов на странице;

### Определения
* **Компонент** - javascript класс, экземпляры которого связаны с определенным HTML-блоком на странице
* **Корневой элемент** - HTML-узел, управляемый компонентом или контроллером
* **Контроллер** - Объект, управляющий созданием и поведением группы компонентов 

### Принцип работы
Компоненты не связаны друг с другом, но "знают" о контроллере, который их создает и управляет их поведением. Так же компоненты не должны ничего знать о каких-то элементах, которые находятся за пределами их корневого элемента. Контроллеру ничего не известно о компонентах. Любой компонент может быть удален из структуры и это не вызовет ошибку в работе других компонентов или контроллера.
Компоненты изменяют свойства контроллера, сообщая ему о каких-то изменениях в них. Контроллер следит за изменением своих свойств и в случае необходимости уведомляет подписаные на определенные события компоненты о произошедших изменениях. Так же контроллер следит за DOM-событиями на своем корневом элементе. Контроллер не должен иметь своих методов, его работа - следить за событиями DOM-дерева и состоянием своих свойств и извещать компоненты об изменениях, генерируя событвенные события. 
Пример:
 1. Изменилась высота корневого элемента компонента =>
 2. Компонент устанавливает новое значение контроллера через метод контроллера set() =>
 3. В контроллере установлен обработчик на событие изменения этого свойства, он "слышит" событие и вызывает метод trigger(), генерируя "новое событие"  =>
 4. Второй компонент слушает "новое событие" и при его изменении реагирует соответствующим образом
Таким образом второй комопнент узнал об изменениях в первом, не имея никакой связи с ним. 

## Подключение
Для работы Components необходима библиотека Jquery.
Первым подключается файл Components.js, затем подключаются компоненты и в конце контроллер(ы)


## Создание компонента

Компонент создается следующей конструкцией:
```sh
Component.create('MainMenu', {
  // в этот объект можно записать свои методы
})
```
Каждый компонент получит следующие свойства:

- *this.controller* - ссылка на объект-контроллер, который управляет компонентов;
- *this.el* - ссылка на корневой DOM-элемент;
- *this.$el* - ссылка на корневой DOM-элемент, обернутый в Jquery-объект;
- *this.options* - объект с опциями, переданными компоненту при создании (опции передаются через объект в методе "onclick" корневого элемента)

## Собственные методы компонента

- **init()** - функция, которая будет запущена при создании компонента, предполагается, что пользователь переопределит эту функцию.
- **events** - массив с перечисленными забиндеными на DOM-элементы событиями. 
Пример: `events = ['click']` будет обрабатывать событие, установленное на одном из элементов внутри компонента со свойством data-click `<div data-click="method">Кликни сюда</div>`. При клике на этот элемент будет вызван метод компонента "method"
- **bindingEvent** - служебная функция для обработки событий, перечисленных в массиве events
- **dataEvent** - служебная функция для обработки событий, перечисленных в массиве events

## Инициализация компонента

Инициализация компонента происходит автоматически. Контроллер ищет внутри своего корневого элемента DOM-узлы со свойством "data-component", получает из него имя класса компонента и создает экземпляр этого класса. В свойства экземпляру будут записаны: ссылка на контроллер, ссылка на DOM-элемент и объект с опциями. Этот объект задается в функцию "onclick" корневоого элемента. 
Пример элемента, который будет связан с компонентом "ComponentName":

`<div data-component="ComponentName" onclick="return {option: value}"></div>`

Создать экземпляр класса можно и вручную, если для этого возникнет необходимость. Все классы лежат в ассоциативном массиве *Controller.components* под своими именами. Так класс "ComponentName" можно вызвать, обратившись к нему **Controller.components["ComponentName"]**. 

## Динамическая подгрузка компонента
Возможна реализация загрузки скрипта компонента по необходимости. Для этого надо добавить элементу компонента параметр "data-component-load" и в нем указать путь к скрипту. Например:

`<div data-component="ComponentName" data-component-load="/static/js/ComponentName.min.js"></div>`

## Создание контроллера

Контроллер - это функция, принимающая два аргумента. 
Первый необязательный аргумент - DOM-элемент, с которым связан контроллер, он будет доступен в свойствах *this.el* и *this.$el* (в Jquery-обертке). **Внимание!** Создание вложенных контроллеров невозможно. То есть внутри корневого элемента контроллера не должно быть элементов, связанных с другими контроллерами. Если первый аргумент не передан, то в контроллер будет работать с объектом document.
Второй, обязательный, аргумент - функция, в которую пользователь пишет свой код. 
Пример создания контроллера:

```sh
new Controller($(document), function(){
// здесь устанавливаются обработчики события и триггеры
})
```

## Методы контроллера

- **findBlocks($jqueryObject)** - ищет внутри переданного в единственном аргументе DOM-элемента (в Jquery-обертке) DOM-узлы со свойством "data-component" и сохраняет их в ассоциативном массиве *Controller.blocks*. В процессе запускает статический метод *Controller.createClassInstanses*, который попытается создать соответствующие компоненты, при наличии нужных классов в ассоциативном массиве *Controller.components*. Этот метод автоматически вызывается при создании экземплара контроллера, но иногда может быть полезно вызвать его вручную, например, для обработки данных, полученных Ajax-запросом.
- **trigger(name, type, data)** - генерирует пользовательское событие. 
_name_ (строка) - имя события, обязательный аргумент
_type_ (строка или null) - тип события, обязательный аргумент, при наличии третьего аргумента, в противном случае не обязательный
_data_ (произвольный тип) - данные, которые будут переданы в обработчик события, необязательный аргумент
- **on(name, type, func, context)** - устанавливает обработчик на пользовательское событие.
_name_ (строка) - имя события, обязательный аргумент
_type_ (строка) - тип события, необязательный аргумент
_func_ - функция, которая будет выполнена при срабатывании события, обязательный аргумент
_context_ (объект) - контекст, в котором будет выполнана переданная функция, необязательный аргумент
- **stopListening(name, func, type)** - удаляет обработчик пользовательского события
_name_ (строка) - имя события, обязательный аргумент
_type_ (строка или null) - тип события, обязательный аргумент 
_func_ - функция, привязанная к событию, обязательный аргумент
- **set(object, bool)** - устанавливает новое значение свойства контроллера, если свойства не существует, то оно будет создано с переданным значением. Метод так же может сгенерировать пользовательское событие 'change' с типом 'имя_измененного_свойства'. В одном вызове можно передать несколько свойств.
_object_ (ассоциативный массив) - объект, типа { имя_свойства: 'новое значение' }
_bool_ - (булево значение) - если передать true, то событие, извещающее об изменениее свойства, сгенерировано не будет
- **isMobile** - (булево значение) - свойство, доступное в контроллере, содержит результат проверки userAgent: мобильное устройство или десктоп

# Пример использования
## 1. Подключение и использование компонентов

Для демонстрации создадим простой скрипт модального окна, которое открывается по клику на кнопке. 
Кнопка и модальное окно находятся в разных частях страницы. Соответственно это два компонента, которые ничего друг о друге не должны знать. Их взаимодействие будет осуществляться через контроллер. 

Для начала необходимо создать файл index.html и подключить к нему библиотеку Jquery, а ниже - Components.js.
Чтобы компоненты заработали, им нужен контроллер. Ниже подключаем файл Controller.js с таким кодом:

`new Controller(function () {  
});`

Пока здесь пустая функция, но экземпляр контроллера необходим для работы. Даже пустой. 

### Создание компонента кнопки Button
Размещаем на странице элемент компонента Button.

`<button data-component='Button' onclick="return {prop: 'modalWindow'}">Button</button>`

Имя компонента - **Button** указывается в параметре **data-component**. В свойстве **onclick** хранится объект с данными, которые будут необходимы для работы компонента, доступ к этому объекту можно будет получить через свойство _this.options_.
После этого необходимо создать компонент "**Button**", к которому будет привязана эта кнопка. Создаем файл Button.js, подключаем его после Components.js и перед Controller.js (в дальнейшем все компоненты необходимо подключать перед контроллером). Добавляем в него следующий код:
```
Component.create('Button', {
    init: function () {
        console.log(this.el);
    }
});
```

Теперь, если обновить страницу, то в консоль будет выведена информация о кнопке: компонент будет найден, связан с DOM-элементом, и запустится функция init(), которую мы определили. 
Функционал кнопки простой: по клику она меняет свой статус на противоположенный. Добавим обработчик события "клик" и свойство, в котором храниться текущий статус:

```
Component.create('Button', {
    init: function () {
         this.status = false;         
          this.$el.on('click', function () {
              this.status = !this.status;
          }.bind(this));
    }
});
```

Кнопка работает, меняет статус. Теперь необходимо поставить в известность о клике контроллер. Ему необходимо в методе _set()_ передать объект формата {prop: value}.
Где prop - свойство в контроллере (если оно не объявлено, то будет создано), а value - его новое значение. 

Соответственно создаем этот объект. Свойство, которое будет меняться, было передано в параметрах комнтроллера, через _onclick_. Конечно, его можно было бы прописать жестко в js-коде, но тогда компонент этой кнопки невозможно будет использовать повторно, т.к. он будет менять определенное свойство. Лучше сделать так, чтобы компонент менял некое свойство, передаваемое в параметрах, тогда, передав другое свойство, можно будет использовать компонент для управления другими элеменами. 
Сейчас в _this.options_ находится объект {prop: 'modalWindow'}.
Создадим новый объект _propsObject = {}_ и запишем в него свойство, переданное в параметрах, присвоив ему значение, соответствующее текущему статусу:
`propsObject[this.options.prop] = this.status`.
Теперь код компонента выглядит так:
```
Component.create('Button', {
    init: function () {
        var propsObject = {};
        this.status = false;
        propsObject[this.options.prop] = this.status;
        this.$el.on('click', function () {
            this.status = !this.status;
        }.bind(this));
    }
});
```
 
Осталось только передать новый статус в контроллер:
`this.controller.set(propsObject);`

И чтобы не устанавливать статус вручную - это может привести к рассинхронизации с контроллером и, как следствие, к ошибкам - подписываемся на событие изменения параметра modalWindow в контроллере. Так статус будет автоматически сихронизирован. 
Итоговый код такой:
```
Component.create('Button', {
    init: function () {
        //Создаемтся объект, который будет передан в контроллер
        var propsObject = {},
            prop = this.options.prop;
        // устанавливается статус по умолчанию
        this.status = false;
        // добавляем свойство в объект
        propsObject[prop] = this.status;
        this.$el.on('click', function () {
            // меняем статус в контроллере
            propsObject[prop] = !this.status;
            this.controller.set(propsObject);
        }.bind(this));
        // слушаем событие изменения свойства в контроллере и актуализируем его
        this.controller.on('change', prop, function (status) {
            this.status = status;
        }, this);
    }
});
```

Все, больше кнопка ничего не делает. Ее нажали - она сообщала в контроллер, что тому надо поменять свое свойство "modalWindow" и передала новое значение этого свойства. Затем актуализировала свой статус. 


### Функционал контроллера

**Это приложение простое и нижеприведенный функционал показывается исключительно для демонстрации возможностей! Реальной необходимости для генерации дополнительного события здесь нет!**

Когда свойство меняется, контроллер генерирует событие 'change' с типом, соответствующим имени изменившегося события. На него можно поставить обработчик:
```
new Controller(function () {
    this.on('change', 'modalWindow', function (status) {
        console.log('На кнопку нажали и передали статус ' + status);
    }, this);
});
```

Теперь при клике на кнопку в консоли будет выводится строка с текущим статусом. Стоит обратить внимание, на то, что в коллбеке обработчика будет доступно новое значение измененного свойства. 
Задача контроллера - сообщить другим компонентам о произошедших изменениях. Для этого можно сгенерировать собственное событие. 

 `this.trigger('modalWindowChanged', null, status);`
 
 Здесь первым аргументом передается строка с именем нашего события, второй аргумент должен быть типом события, но в данном случае событие не имеет типа. Третий аргумент - любые данные, которые получит коллбек обработчика события так же, как выше получил status обработчик события 'change'. Этот самый статус мы и передадим в третьем аргументе:
```
new Controller(function () {
    this.on('change', 'modalWindow', function (status) {
        this.trigger('modalWindowChanged', null, status);
    }, this);
});
```

Все, работа контроллера завершена. 
Теперь событие должны обработать компоненты, которые его ждут. Это может быть один компонент модального окна или несколько компонентов, например, компонент другого модального окна должен скрыть себя при срабатывании этого события, а компонент оверлея должен отобразить темный фон и т.д.

**Но на самом деле в данном случае это явное усложнение, поэтому оставляем контроллер пустым. **

### Создание компонента модального окна Modal

Компонент модального окна умеет только показывать или скрывать свой корневой элемент. Делает он это когда изменияется (событие 'change') свойство "modalWindow" (тип события "modalWindow"). Если ему в коллбек передано значение true - он покажет элемент, если false - скроет. 

Подключаем файл Modal.js где-нибудь между Components.js и Controller.js (как и любые другие компоненты). И добавляем на страницу код:
`<div data-component="Modal" hidden>Модальное окно</div>`
При загрузке страницы окно скрыто. 
Теперь создаем компонент и добавляем ему два метода: _hide()_ и _show()_, которые соответственно скрывают или показывают модальное окно:
```
Component.create('Modal', {
    hide: function () {
        this.el.hidden = true;
    },
    show: function () {
        this.el.hidden = false;
    }
});
```

_На самом деле делать эти два метода публичными - это не совсем верное решение и оно может привести впоследсвтии к ошибкам, но пока пусть будет так, для демонстрации этой проблемы в дальнейшем._

Свойство _this.el_ ссылается на корневой элемент компонента и оно доступно в компоненте без дополнительного объявления, так же как и свойство _this.$el_ - тот же элемент в jquery-обертке. 

В функцию _init()_ прописываем обработчик события 'change':
```
init: function () {
    this.controller.on('change', 'modalWindow', function (status) {
        if(status === true) {
            this.show();
        } else {
            this.hide();
        }
    }, this);
},
```
В зависимости от нового статуса показываем или скрываем окно. 

Полный код компонента:
```
Component.create('Modal', {
    init: function () {
        this.controller.on('change', 'modalWindow', function (status) {
            if(status === true) {
                this.show();
            } else {
                this.hide();
            }
        }, this);
    },
    hide: function () {
        this.el.hidden = true;
    },
    show: function () {
        this.el.hidden = false;
    }
});
```

## 2. Декларативный метод обработки браузерных событий

Для демонстрации в компонент Modal добавим новый функционал - кнопку, закрывающую окно. Теперь HTML-код компонента выглядит так:
`<div data-component="Modal" hidden>Модальное окно <a>X</a></div>`
Тег <a> с крестиком внутри - это кнопка, при клике на которую окно должно закрываться. 

Обычный подход состоит в поиске элемента и навешивании на него события (что-то типа $('a', $el).on('click', function.....)), что связывает js-код с HTML или классами вроде таких: 'close-button_js'. В итоге, изменив HTML, можно сломать скрипт, а кроме того, нарушается реиспользование кода. Поэтому в данной библиотеке применяется декларативное объевление обработчиков события:
`<div data-component="Modal" hidden>Модальное окно <a data-click="<тут_какой_то_метод>">X</a></div>`
В параметре data-click передается имя метода компонента, который будет вызыван при срабатывании события 'click'. 

Чтобы комопнент начал отслеживать декларативно объявленное событие, ему надо передать имя события в массиве 'events' = [];
Добавляем в компонент Modal такую конструкцию:
```
Component.create('Modal', {
    events: ['click'],
    // тут остальной код
```

Самый очевидным решением кажется добавить в обработчик метод hide():
`<a data-click="hide">X</a>`
и это будет работать. Но здесь есть засада, которая упомяналсь выше: окно закроется, но об этом не узнает контроллер и другие компоненты, которые, возможно, должны как-то отреагировать на это. Именно поэтому  делать _hide()_ и _show()_ публичными методами - решение не верное. Их следует спрятать от доступа внутри какого-то метода, а для закрытия окна следует просто менять статус окна в контроллере. Для этого создадим метод close() 
```
    close: function () {
        this.controller.set({modalWindow: false});
    }
```
И запишем его в кнопку:
`<a data-click="close">X</a>`

Полный код компонента Modal теперь выглядит так:
```
Component.create('Modal', {
    events: ['click'],
    init: function () {
        this.controller.on('change', 'modalWindow', function (status) {
            if(status) {
                show.apply(this);
            } else {
                hide.apply(this);
            }
        }, this);
        function hide() {
            this.el.hidden = true;
        }
        function show() {
            this.el.hidden = false;
        }
    },
    close: function () {
        this.controller.set({modalWindow: false});
    }
});
```

Сокрытие и показ злемента теперь внутренние методы, которые срабатывают в зависимости от состояния свойства 'modalWindow' в контроллере.
Закрывается окно не напрямую, а через управление этим свойством. 

В заключении содержимое файла .html:
```
<button data-component='Button' onclick="return {prop: 'modalWindow'}">Button</button>
<div data-component="Modal" hidden>Модальное окно</div>
<script src="../libs/jquery/dist/jquery.min.js"></script>
<script src="../Components.js"></script>
<script src="Modal.js"></script>
<script src="Button.js"></script>
<script src="Controller.js"></script>
```
