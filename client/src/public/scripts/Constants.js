export default class Constants {
    constructor(_main) {
        this.mainClass = _main;
    }

    getStatusColor(status) {
        switch(status) {
            case 0:
                return "#676767";

            case 1:
                return "#3baf3b";

            case 2:
                return "#ffc061";

            case 3:
                return "#ff6161";
        }
    }
}