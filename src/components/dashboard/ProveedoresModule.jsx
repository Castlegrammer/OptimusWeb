import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Phone, FileText, X, Building2, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function ProveedoresModule({ bcvRate = 884.75 }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [rif, setRif] = useState('');
  const [phone, setPhone] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await api.proveedores.getAll(search);
      setSuppliers(data);
    } catch (err) {
      console.error('Error al cargar proveedores de MySQL:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      fetchSuppliers();
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    try {
      await api.proveedores.create({
        nombre: name.trim(),
        responsable: contact.trim() || 'Contacto Comercial',
        direccion: rif.trim() || '',
        telefono: phone.trim() || '',
        zona: 'Principal'
      });

      setName('');
      setContact('');
      setRif('');
      setPhone('');
      setShowModal(false);
      await fetchSuppliers();
    } catch (err) {
      alert(err.message || 'Error al guardar proveedor en MySQL');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uuid, provName) => {
    if (!window.confirm(`¿Estás seguro de eliminar al proveedor "${provName}"?`)) return;
    try {
      await api.proveedores.delete(uuid);
      setSuppliers(prev => prev.filter(p => (p.uuid || p.id) !== uuid));
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const filtered = suppliers.filter(s => {
    const sName = s.nombre || s.name || '';
    const sRif = s.direccion || s.rif || '';
    const sResp = s.responsable || s.contact || '';
    const term = search.toLowerCase();
    return sName.toLowerCase().includes(term) || sRif.toLowerCase().includes(term) || sResp.toLowerCase().includes(term);
  });

  const totalDebt = suppliers.reduce((sum, s) => sum + (Number(s.deuda) || Number(s.debtUsd) || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Directorio de Proveedores & Distribuidores</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Conectado a MySQL" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de distribuidores de mercancía desde la base de datos central (BCV: <strong>Bs. {bcvRate.toFixed(2)}</strong>)
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={fetchSuppliers}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
            title="Recargar desde la base de datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

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
          onKeyDown={handleSearchSubmit}
          placeholder="Buscar proveedor por razón social, contacto o RIF... (Enter para buscar)"
          className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
        />
      </div>

      {/* Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Consultando proveedores en la base de datos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <Truck className="w-8 h-8 text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No hay proveedores registrados en la base de datos</p>
            <p className="text-slate-400">Haz clic en "Nuevo Proveedor" para registrar distribuidores de mercancía.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Razón Social / RIF</th>
                  <th className="py-3.5 px-4">Contacto</th>
                  <th className="py-3.5 px-4">Teléfono</th>
                  <th className="py-3.5 px-4">Zona / Dirección</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const sName = s.nombre || s.name;
                  const sRif = s.direccion || s.rif || 'Sin RIF';
                  const sResp = s.responsable || s.contact || 'Contacto Directo';
                  const sPhone = s.telefono || s.phone || 'Sin teléfono';
                  const sUuid = s.uuid || s.id;

                  return (
                    <tr key={sUuid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 block">{sName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{sRif}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{sResp}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{sPhone}</td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {s.zona || 'Principal'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleDelete(sUuid, sName)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar proveedor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
                  <p className="text-[11px] text-slate-500">Se registrará en la base de datos central MySQL</p>
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
                <label className="block text-slate-700 font-bold mb-1">Contacto o Asesor Comercial:</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez (Ventas)"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
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
                  <label className="block text-slate-700 font-bold mb-1">Teléfono:</label>
                  <input
                    type="text"
                    placeholder="+58 412 0000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
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
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Guardando...' : 'Guardar Proveedor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}