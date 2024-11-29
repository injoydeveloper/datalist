
(function() {
    if (!document.querySelector("#datalist-style")) {
        let style = document.createElement("style");
        style.id = "datalist-style";
        style.textContent = `
            fieldset {
                border: 1px solid black;
                width: 360px;
                border-radius: 5px;
            }

            legend, label{
                color: black; 
                font-family: sans-serif;
            }

            input[list] {
                padding: 5px;
                /*height: 35px;*/
                width: 1000px;
                border: 1px solid black;
                outline: none;
                border-radius: 5px;
                color: black;
            /*   border-bottom: none; */
            }

            datalist {
                position: absolute;
                background-color: white;
                border: 1px solid black;
                border-radius: 0 0 5px 5px;
                border-top: none;
                font-family: sans-serif;
                width: 1000px;
                padding: 5px;
                max-height: 10rem;
                overflow-y: auto
            }

            option {
                background-color: white;
                padding: 4px;
                color: black;
                margin-bottom: 1px;
                cursor: pointer;
            }

            option:hover,  .active{
                background-color: lightgray;
            }
        `;
        document.head.appendChild(style);
    }

    function addActive(x) {
        if (!x) {
            return false;
        }
        
        removeActive(x);
        if (currentFocus >= x.length) {
            currentFocus = 0;
        }
        if (currentFocus < 0) {
            currentFocus = (x.length - 1);
        }
        x[currentFocus].classList.add("active");
    }

    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("active");
        }
    }

    function dataListStyle() {
        
        let datalists = document.querySelectorAll('datalist');
        for (let datalist of datalists) {
            datalist.setAttribute("role",'listbox'); // style variable //
        }

        let inputs = document.querySelectorAll('input[list]');
        for (let input of inputs) {
            
            if (!input.getAttribute('data-list')) {
     
                // find corresponding datalist
                let listID = input.getAttribute('list');
                let list = document.getElementById(listID);
                
                input.setAttribute("data-list", listID);
                input.setAttribute("list", "");

                input.setAttribute("autocomplete", "off");
                input.setAttribute("role", "combobox");
                // if the z-index of the input is less than the z-index of the datalist, the datalist will be hidden behind the input
                // we also need a mutation observer to watch for new options being added to the datalist or new datalist inputs being added to the page
                // adobt the datalist node and move it in the page as it's being used so that it is immediately after the input.
                // the fieldset element is used to group the input and datalist together. What if there's no fieldset? the input needs to be left justified, so we have to use a legend element instead of a label element

                let options = list.querySelectorAll('option');
                let currentFocus = -1;

                input.addEventListener("focus", function() {
                    
                    list.style.display = 'block';  // style variable //
                    input.style.borderRadius = "5px 5px 0 0"; // style variable //
                    let inputOffset = getOffset(input);
                    let inputHeight = input.offsetHeight;

                    let inputzIndex = window.getComputedStyle(input).getPropertyValue('z-index');
                    list.style.zIndex = inputzIndex;
                    list.style.top = inputOffset.top + inputHeight + "px";
                    list.style.left = inputOffset.left + "px";
                    

                    for (let option of options) {
                        option.addEventListener("click", function() {
                            input.value = option.value;
                            input.dispatchEvent(new Event("input"))
                            list.style.display = 'none'; // style variable //
                            input.style.borderRadius = "5px"; // style variable //
                        });
                    }
                });

                input.addEventListener("input", function() {
                    currentFocus = -1;
                    let text = input.value.toUpperCase();
                    for (let option of options) {
                        if (option.value.toUpperCase().indexOf(text) > -1) {
                            option.style.display = "block";
                        } else {
                            option.style.display = "none";
                        }
                    }
                });

                input.addEventListener("keydown", function(e) {
                    if (e.keyCode == 40) {
                        currentFocus++;
                        addActive(options);
                    } else if (e.keyCode == 38) {
                        currentFocus--;
                        addActive(options);
                    } else if (e.keyCode == 13) {
                        e.preventDefault();
                        if (currentFocus > -1) {
                            /* and simulate a click on the "active" item: */
                            if (options) {
                                options[currentFocus].click();
                            }
                        }
                    }
                });
            }
        }
    }

    function getOffset(el) {
        const rect = el.getBoundingClientRect();
        return {
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY
        };
      }

    const targetNode = document.getElementsByTagName('body')[0];
    const observer = new MutationObserver(function(mutationsList, observer) {
        observer.disconnect();
        dataListStyle();
        observer.observe(targetNode, {childList:true,subtree: true});
    });
    const config = {childList:true,subtree: true};

    observer.observe(targetNode, config);


})();
