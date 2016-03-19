var textarea = document.getElementById('code_input');

textarea.addEventListener('keydown', check_tab);
// textarea.addEventListener('change', check_tab);

document.querySelector('form').addEventListener('submit', process);

function check_tab(e){
    // Check for tab key.
    // If a tab key is pressed put a tab character
    // into the code box instead of cycling to the next
    // form element.
    var key = e.keyCode || e.which;

    if(key == 9){
        e.preventDefault();

        var cursor = textarea.selectionStart;

        textarea.value = textarea.value.substring(0, cursor) + '\t' + textarea.value.substring(cursor);
        textarea.selectionStart = textarea.selectionEnd = cursor + 1;
    }

}

function detect_lang(){
    var code = textarea.value;
    var result = hljs.highlightAuto(code);
    return result.language;
}

function update_lang(e){
    check_tab();

    var curr_lang = document.getElementById('current_lang');
    var lang = detect_lang();

    if(lang) lang = lang.toUpperCase();

    curr_lang.innerText = lang || 'None';
}

function process(e){
    e.preventDefault();

    var request = new XMLHttpRequest();
    request.responseType = 'json';

    var data = new FormData();
    data.append('code', textarea.value);

    request.addEventListener('load', function(resp){
        if(request.readyState !== 4) return;

        resp = resp.target;

        if(resp.status !== 200){
            alert('Oops. Something went wrong. Please try again later.');
        }
        else{
            location.href = '/' + resp.response.snowflake;
        }
    });

    request.open('POST', '/share');
    request.send(data);
}
