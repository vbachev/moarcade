define(function () {

    function getRandomColor () {
        var n = 10; // number of unique colors
        return 'hsl(' + (Math.floor(Math.random() * n) * 360 / n) + ',80%,40%)';
    }

    function Player (data) {
        return {
            id : data.id,
            name : data.name || 'Anonymous #' + data.id,
            score : 0,
            color : getRandomColor()
        };
    }

    return Player;
});