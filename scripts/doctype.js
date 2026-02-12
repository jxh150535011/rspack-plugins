import { Application } from 'typedoc';
import { join } from 'path';
const root = process.cwd();

const outDir = join(root, './docs_test');

// npx typedoc --name "概要" --entryPoints ./test-packages/utils-test/src/index.ts --plugin typedoc-plugin-markdown --out ./docs_test_cli

const app = await Application.bootstrapWithPlugins({
  name: '概要',
  entryPoints: ['./test-packages/utils-test/src/index.ts'],
  out: outDir,
  plugin: ['typedoc-plugin-markdown'],
  cleanOutputDir: true,
});

// app = await td.Application.bootstrapWithPlugins({}, [
//     new td.ArgumentsReader(0),
//     new td.TypeDocReader(),
//     new td.PackageJsonReader(),
//     new td.TSConfigReader(),
//     new td.ArgumentsReader(300).ignoreErrors(),
// ]);

const project = await app.convert();
if (project) {
  await app.generateOutputs(project, outDir);
}
