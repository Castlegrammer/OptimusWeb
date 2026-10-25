import React, { useState } from 'react';
import { Truck, Plus, Search, Phone, FileText, X, Building2 } from 'lucide-react';

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
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Directorio de Proveedores & Cuentas por Pagar</h2>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Gestión de distribuidores de mercancía, plazos y compras a crédito</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Por pagar a distribuidores:</div>
            <div className="text-base font-extrabold font-mono text-slate-900">
              ${totalDebt.toFixed(2)} USD
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar proveedor por razón social o RIF..."
          className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
        />
      </div>

      {/* Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Razón Social / RIF</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4">Teléfono</th>
                <th className="py-3.5 px-4">Condición de Pago</th>
                <th className="py-3.5 px-4">Saldo Pendiente USD</th>
                <th className="py-3.5 px-5">Saldo en Bs (BCV)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-slate-900 block">{s.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{s.rif}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{s.contact}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{s.phone}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      s.creditTerms === 'Contado' 
                        ? 'bg-slate-100 text-slate-700 border-slate-200' 
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}>
                      {s.creditTerms}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-slate-950 text-sm">
                    <span className={s.debtUsd > 0 ? 'text-amber-950' : 'text-slate-400'}>
                      ${s.debtUsd.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-emerald-800 font-semibold">
                    {s.debtUsd > 0 ? `Bs. ${(s.debtUsd * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 2 })}` : 'Bs. 0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Proveedor */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full relative shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Nuevo Proveedor</h3>
                  <p className="text-[11px] text-slate-500">Agrega un distribuidor a tu agenda</p>
                </div>
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Razón Social / Nombre Comercial:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej. Distribuidora Santa Elena C.A."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">RIF de la Empresa:</label>
                <input
                  type="text"
                  placeholder="J-12345678-9"
                  value={rif}
                  onChange={(e) => setRif(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Teléfono del Preventista / Oficina:</label>
                <input
                  type="text"
                  placeholder="+58 412 0000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
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
