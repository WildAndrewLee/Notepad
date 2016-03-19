/*
 * Show line numbers
 */

var code = document.getElementsByTagName('code')[0];
var pre = document.getElementsByTagName('pre')[0];
var lines = code.innerText.split('\n').length;
var ul = document.createElement('ul');
var highlighted = null;
var original_url = location.href.replace(/#\d+$/, '');
var line_number = parseInt(location.href.replace(/^.+#(\d+)$/, '$1'));

ul.id = 'line_numbers'

for(var line = 1; line <= lines; line++){
    var li = document.createElement('li');
    li.innerText = line;
    li.id = line;

    if(line === line_number){
        li.classList.add('highlighted');
        highlighted = li;
    }

    (function(line, li){
        li.addEventListener('mousedown', function(){
            if(highlighted) highlighted.classList.remove('highlighted');

            li.classList.add('highlighted');
            highlighted = li;

            location.href = original_url + '#' + line;
        });
    })(line, li);

    ul.appendChild(li);
}

pre.insertBefore(ul, code);

/*
 * Highlight selected line
 */

/*
 * Ctrl-A functionality
 */

var ctrl = false;

document.body.addEventListener('keydown', function(e){
    if(e.which === 17) ctrl = true;
    if(e.which !== 97 && e.which !== 65) return;
    if(!ctrl) return;

    e.preventDefault();

    var range = document.createRange();
    range.selectNode(code);
    window.getSelection().addRange(range);
});

document.body.addEventListener('keyup', function(e){
    if(e.which === 17) ctrl = false;
});

/*
 * Perform highlight
 */

hljs.configure({ tabReplace: '    '});
hljs.initHighlighting();
