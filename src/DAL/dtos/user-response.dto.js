export default class UsersResponse {
    constructor(user) {
        this._id = user._id;
        this.first_name = user.name ? user.name.split(" ")[0] : null;
        this.last_name = user.name ? user.name.split(" ")[user.name.split(" ").length - 1] : null;
        this.email = user.email;
        this.age = user.age;
        this.password = user.password;
        this.isGithub = user.isGithub;
        this.cart = user.cart;
        this.role = user.role;
        this.documents = user.documents;
        this.last_connection = user.last_connection;
    }
}