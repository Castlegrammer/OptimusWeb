import React, { useState } from 'react';
import { Truck, Plus, Search, Phone, FileText } from 'lucide-react';

export default function ProveedoresModule({ bcvRate = 884.75 }) {
  const [suppliers, setSuppliers] = useState([
    { id: 'PROV-01', name: 'Empresas Polar C.A.', rif: 'J-00041312-9', contact: 'Asesor Comercial Rutas', phone: '+58 212 2023111', debtUsd: 0.00, creditTerms: 'Contado' },
    { id: 'PROV-02', name: 'Distribuidora Lácteos Los Andes', rif: 'J-30459201-1', contact: 'Despacho Central', phone: '+58 274 2529810', debtUsd: 450.00, creditTerms: 'Crédito 15 días' },
    { id: 'PROV-03', name: 'Inversiones Kimberly Clark', rif: 'J-00192837-4', contact: 'Atención Mayoristas', phone: '+58 212 9014500', debtUsd: 0.00, creditTerms: 'Contado' },
    { id: 'PROV-04', name: 'Cervecería Regional C.A.', rif: 'J-00038910-2', contact: 'Preventa Zona Centro', phone: '+58 241 8712300', debtUsd: 180.00, creditTerms: 'Crédito 7 días' },
  ]);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [rif, setRif] = useState('');
  const [phone, setPhone] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name) return;
    setSuppliers([...suppliers, {
      id: `PROV-0${suppliers.length + 1}`,
      name,
      rif: rif || 'J-00000000-0',
      contact: 'Contacto Directo',
      phone: phone || '+58 212 0000000',
      debtUsd: 0,
      creditTerms: 'Contado'
    }]);
    setName('');
    setRif('');
    setPhone('');
    setShowModal(false);
  };

  const totalDebt = suppliers.reduce((sum, s) => sum + s.debtUsd, 0);

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.rif.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-neutral-950">Directorio de Proveedores & Cuentas por Pagar</h2>
          <p className="text-xs text-neutral-500">Gestión de distribuidores, plazos de crédito y compras pendientes</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Total por pagar a distribuidores</div>
            <div className="text-base font-bold font-mono text-neutral-950">
              ${totalDebt.toFixed(2)} USD
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por razón social o RIF..."
          className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950"
        />
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Razón Social / RIF</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Condición de pago</th>
                <th className="py-3 px-4">Saldo Pendiente USD</th>
                <th className="py-3 px-4">Saldo en Bs (Tasa BCV)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-neutral-950 block">{s.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{s.rif}</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-600">{s.contact}</td>
                  <td className="py-3 px-4 font-mono text-neutral-500">{s.phone}</td>
                  <td className="py-3 px-4">
                    <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-medium">
                      {s.creditTerms}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-neutral-950">
                    <span className={s.debtUsd > 0 ? 'text-amber-900' : 'text-neutral-400'}>
                      ${s.debtUsd.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-600">
                    {s.debtUsd > 0 ? `Bs. ${(s.debtUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : 'Bs. 0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-sm w-full relative shadow-xl text-xs space-y-3">
            <h3 className="text-base font-bold text-neutral-950">Nuevo Proveedor</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Razón Social</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Distribuidora Central C.A."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">RIF</label>
                <input
                  type="text"
                  placeholder="J-12345678-9"
                  value={rif}
                  onChange={(e) => setRif(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 font-mono focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="+58 212..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 font-mono focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 text-neutral-600 hover:text-neutral-950 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl font-semibold"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
