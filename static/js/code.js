var code = document.getElementsByTagName('code')[0];
var pre = document.getElementsByTagName('pre')[0];
var lines = code.innerText.split('\n').length;
var ul = document.createElement('ul');
ul.id = 'line_numbers'

for(var line = 1; line <= lines; line++){
    var li = document.createElement('li');
    li.innerText = line;
    ul.appendChild(li);
}

pre.insertBefore(ul, code);

hljs.configure({ tabReplace: '    '});
hljs.initHighlighting();

var ctrl = false;

document.body.addEventListener('keydown', function(e){
    if(e.which === 17) ctrl = true;
    if(e.which !== 97 && e.which !== 65) return;

    e.preventDefault();

    var range = document.createRange();
    range.selectNode(code);
    window.getSelection().addRange(range);
});

document.body.addEventListener('keyup', function(e){
    if(e.which === 17) ctrl = false;
});
