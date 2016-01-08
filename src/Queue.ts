module wdCb {
    export class Queue<T> extends List<T>{
        public static create<T>(children = []){
            var obj = new this(<Array<T>>children);

            return obj;
        }

        constructor(children:Array<T> = []){
            super();

            this.children = children;
        }

        public push(element:T){
            this.children.unshift(element);
        }

        public pop(){
            return this.children.pop();
        }

        public clear(){
            this.removeAllChildren();
        }
    }
}
