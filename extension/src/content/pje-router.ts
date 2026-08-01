import { PJeAdapter } from '../adapters/pje-base-adapter';
import { PJeTarefasAdapter } from '../adapters/pje-tarefas-adapter';
import { PJeAutosAdapter } from '../adapters/pje-autos-adapter';

const adapters: PJeAdapter[] = [
  new PJeTarefasAdapter(),
  new PJeAutosAdapter()
];

export function resolveAdapter(doc: Document): PJeAdapter | null {
  for (const adapter of adapters) {
    if (adapter.canHandle(doc)) {
      return adapter;
    }
  }
  return null;
}
