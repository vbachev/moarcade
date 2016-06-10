define(function () {

    function getRandomColor () {
        return 'hsl(' + (Math.floor(Math.random()*36)*10) + ',80%,40%)';
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