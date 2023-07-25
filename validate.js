function Validator(options){
    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {};

    // Hàm thực hiện validate
    function validate (inputElement, rule){
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage;

        // lấy ra các rules của selector
        var rules = selectorRules[rule.selector]

        // lặp qua từng rule và kiểm tra
        // nếu có lỗi thì dừng việc kiểm tra
        for(var i = 0; i< rules.length; i++){
            switch(inputElement.type){
                case 'radio':
                case 'checked':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default: 
                    errorMessage = rules[i](inputElement.value)
            }
            if(errorMessage) break
        }
        if(errorMessage){
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        }
        else{
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')

        }
        return !errorMessage
    }
    // lấy Element của form cần validate
    var formElement = document.querySelector(options.form)
    if(formElement){
        formElement.onsubmit = function(e){
            e.preventDefault()
            var isFormValid = true;
            // lặp qua từng rules và validate
            options.rules.forEach( function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid){
                    isFormValid = false
                }
            })
            if(isFormValid){
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        switch(input.type){
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    values[input.name] =''
                                    return values
                                }
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] =  []
                                }
                                values[input.name].push(input.value)
                                break;
                                case 'file':
                                    values[input.name] = input.files
                                break;
                            default: 
                                values[input.name] = input.value
                            }
                        return values;
                    },{})
                    options.onSubmit({formValues})
                }
            }
        }
    }


        // lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ...)
        options.rules.forEach( function(rule) {
            // lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector] = [rule.test];
            }
            
            var inputElements = formElement.querySelectorAll(rule.selector)

            Array.from(inputElements).forEach(function(inputElement){
                // xử lý trường hợp blur khỏi input
                    inputElement.onblur = function(){
                        validate(inputElement, rule)
                    }

                // xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function(){
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message')
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
                
            })
            
        });
    }
Validator.isRequired = function (selector){
    return {
        selector: selector,
        test: function(value){
            return value ?undefined : 'Vui lòng nhập trường này'
        }
    }
}
Validator.isEmail = function (selector){
    return {
            selector: selector,
            test: function(value){
                var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
                return regex.test(value) ?undefined :'Trường này phải là email'
            }
        }
}
Validator.minLength = function (selector, min){
    return {
            selector: selector,
            test: function(value){
                return value.length >= min ?undefined :`Vui lòng nhập tối thiểu ${min} kí tự`;
            }
        }
}
Validator.isConfirmed = function(selector, getConfirmValue, msg){
    return {
        selector: selector,
        test: function(value){
            return value === getConfirmValue() ?undefined : msg || 'Giá trị nhập vào không đúng'
           
        }
    }

}