let fs = require('fs');
let solc = require('solc');

function findImports(importPath: string) {
    try {
        if (importPath.startsWith('@')) {
            return {contents: fs.readFileSync(`node_modules/${importPath}`, 'utf8')};
        } else {
            return {contents: fs.readFileSync(`smartcontracts/${importPath}`, 'utf8')};
        }
    } catch (e: any) {
        return {
            error: e.message
        };
    }
}

export function loadCompiledSols(solNames: string[]): any {
    interface SolCollection { [key: string]: any };

    let sources: SolCollection = {};
    solNames.forEach((value: string, index: number, array: string[]) => {
        let a_file = fs.readFileSync(`smartcontracts/${value}.sol`, 'utf8');
        sources[value] = {
            content: a_file
        };
    });
    let input = {
        language: 'Solidity',
        sources: sources,
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    let compiler_output = solc.compile(JSON.stringify(input), { import: findImports });

    let output = JSON.parse(compiler_output);

    return output;
}