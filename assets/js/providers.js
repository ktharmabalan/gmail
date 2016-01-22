myApp.provider('mailProvider', function() {

    this.categories = [];

    this.$get = function() {
        var categories = this.categories;
        return {
            getCategories: function() {
                return categories;
            }
        }
    };

    this.setCategories = function(categories) {
        this.categories = categories;
    };
});