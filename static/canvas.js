const canvas = document.getElementById('canvas');
canvas.style.border = '2px dotted green';
const c = canvas.getContext('2d');

c.strokeStyle = '#383428';
var x;
var y;
var move;
var sig = document.getElementById('signature');

canvas.addEventListener('mousedown', function(e) {
    e.stopPropagation();
    x = e.offsetX;
    y = e.offsetY;
    canvas.addEventListener(
        'mousemove',
        (move = function(e) {
            c.moveTo(x, y);
            x = e.offsetX;
            y = e.offsetY;
            c.lineTo(x, y);
            c.stroke();
        })
    );
});

document.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', move);
    sig.value = canvas.toDataURL();
    console.log('sig.val: ', sig.value);
});
