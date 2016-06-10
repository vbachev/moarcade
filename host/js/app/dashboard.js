define(['qrcode'], function (_QRCode) {
    var playersList;

    function getListElement () {
        return playersList || $('.players');
    }

    return {
        addPlayer : function (player) {
            var listItem = $('<li class="player-' + player.id + '" style="color:' + player.color + '"/>');
            listItem.text(player.name).append('<span class="score"></span>');
            getListElement().append(listItem);
        },

        removePlayer : function (player) {
            getListElement().find('.player-' + player.id).remove();
        },
        
        updateScore : function (player) {
            getListElement().find('.player-' + player.id).find('.score').text(player.score);
        },
        
        setURL : function (data) {
            $('.joinMessage').html('<a href="' + data.url + '" target="_blank">' + data.url + '</a>');

            $('.qrCode').empty();
            new QRCode($('.qrCode')[0], {
                text: data.url,
                width: 180,
                height: 180,
                colorDark : "#0d0a10",
                colorLight : "#dcd0bc"
            });
        }
    };
});