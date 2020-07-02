import * as webpack from 'webpack';
export interface IAddWorkerEntryPointPluginOptions {
    id: string;
    entry: string;
    filename: string;
    chunkFilename?: string;
    plugins: webpack.Plugin[];
}
export declare class AddWorkerEntryPointPlugin implements webpack.Plugin {
    private readonly options;
    constructor({ id, entry, filename, chunkFilename, plugins }: IAddWorkerEntryPointPluginOptions);
    apply(compiler: webpack.Compiler): void;
}
