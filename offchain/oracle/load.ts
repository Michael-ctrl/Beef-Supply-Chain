let fs = require('fs');
let solc = require('solc');

function findImports(importPath: string) {
    try {
        return {
            contents: fs.readFileSync(`smart_contracts/${importPath}`, 'utf8')
        };
    } catch (e) {
        return {
            error: e.message
        };
    }
}

export function loadCompiledSols(solNames: string[]): any {
    interface SolCollection { [key: string]: any };

    let sources: SolCollection = {};
    solNames.forEach((value: string, index: number, array: string[]) => {
        let a_file = fs.readFileSync(`smart_contracts/${value}.sol`, 'utf8');
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