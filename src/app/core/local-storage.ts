export class LocalStorage<T> {
    constructor(private key: string, private defaultValue?: T) { }

    get value(): T {
        const item = localStorage.getItem(this.key);
        if (item !== null) {
            try {
                return JSON.parse(item);
            } catch {
                return this.defaultValue as T;
            }
        }
        return this.defaultValue as T;
    }

    set value(val: T) {
        localStorage.setItem(this.key, JSON.stringify(val));
    }
}
