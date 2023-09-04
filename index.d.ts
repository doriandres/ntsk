export type TaskContext = {
    threadId: number;
    require: NodeRequire;
    __filename: string,
    __dirname: string,    
};

export function task<TF extends (ctx: TaskContext, args: any) => Promise<any>>(args: Parameters<TF>[1], task: TF): ReturnType<TF>;