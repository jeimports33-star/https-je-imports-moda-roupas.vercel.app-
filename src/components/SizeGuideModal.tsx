import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Ruler, HelpCircle } from 'lucide-react';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useStore();

  if (!isSizeGuideOpen) return null;

  return (
    <div 
      id="size-guide-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => setIsSizeGuideOpen(false)}
    >
      <div 
        id="size-guide-card"
        className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 relative space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-neutral-900" />
            <h3 className="font-display font-bold text-lg text-neutral-950">
              Guia & Tabela de Medidas (cm)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsSizeGuideOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-neutral-500">
          Nossas modelagens seguem o padrão streetwear relaxed/oversized. Se preferir um caimento mais justo, opte por um tamanho menor.
        </p>

        {/* Measurement Table */}
        <div className="overflow-x-auto rounded-2xl border border-neutral-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-900 uppercase font-bold border-b border-neutral-200">
              <tr>
                <th className="p-3">Tamanho</th>
                <th className="p-3">Tórax (cm)</th>
                <th className="p-3">Cintura (cm)</th>
                <th className="p-3">Quadril (cm)</th>
                <th className="p-3">Comprimento (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
              <tr>
                <td className="p-3 font-bold text-neutral-900">PP</td>
                <td className="p-3">88 - 92</td>
                <td className="p-3">72 - 76</td>
                <td className="p-3">90 - 94</td>
                <td className="p-3">68</td>
              </tr>
              <tr className="bg-neutral-50/50">
                <td className="p-3 font-bold text-neutral-900">P</td>
                <td className="p-3">92 - 98</td>
                <td className="p-3">76 - 82</td>
                <td className="p-3">94 - 100</td>
                <td className="p-3">71</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-neutral-900">M</td>
                <td className="p-3">98 - 104</td>
                <td className="p-3">82 - 88</td>
                <td className="p-3">100 - 106</td>
                <td className="p-3">74</td>
              </tr>
              <tr className="bg-neutral-50/50">
                <td className="p-3 font-bold text-neutral-900">G</td>
                <td className="p-3">104 - 110</td>
                <td className="p-3">88 - 94</td>
                <td className="p-3">106 - 112</td>
                <td className="p-3">77</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-neutral-900">GG</td>
                <td className="p-3">110 - 118</td>
                <td className="p-3">94 - 102</td>
                <td className="p-3">112 - 120</td>
                <td className="p-3">80</td>
              </tr>
              <tr className="bg-neutral-50/50">
                <td className="p-3 font-bold text-neutral-900">XG</td>
                <td className="p-3">118 - 126</td>
                <td className="p-3">102 - 110</td>
                <td className="p-3">120 - 128</td>
                <td className="p-3">83</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tips */}
        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex items-start gap-3 text-xs text-neutral-600">
          <HelpCircle className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-neutral-900 block">Como medir corretamente:</span>
            <p>• <strong>Tórax:</strong> Passe a fita métrica na parte mais volumosa do peito, mantendo a fita reta nas costas.</p>
            <p>• <strong>Cintura:</strong> Meça na altura do umbigo sem apertar a fita.</p>
            <p>• <strong>Comprimento:</strong> Meça do ponto mais alto do ombro até a bainha inferior da peça.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSizeGuideOpen(false)}
          className="w-full py-3 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition-colors"
        >
          Entendido, Fechar Guia
        </button>
      </div>
    </div>
  );
};
