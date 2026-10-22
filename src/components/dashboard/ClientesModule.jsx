import React, { useState } from 'react';
import { Users, Plus, Search, Send, Check, DollarSign } from 'lucide-react';

export default function ClientesModule({ bcvRate = 884.75 }) {
  const [clients, setClients] = useState([
    { id: 'CLI-01', name: 'Roberto Gómez', phone: '+58 412 1234567', debtUsd: 145.00, creditLimit: 300.00, lastBuy: 'Hace 3 días', status: 'Vencido' },
    { id: 'CLI-02', name: 'Carmen Silva', phone: '+58 414 7654321', debtUsd: 48.50, creditLimit: 150.00, lastBuy: 'Ayer', status: 'Al día' },
    { id: 'CLI-03', name: 'Taller Mecánico Central', phone: '+58 424 9876543', debtUsd: 320.00, creditLimit: 500.00, lastBuy: 'Hace 6 días', status: 'Vencido' },
    { id: 'CLI-04', name: 'María Eugenia Rivas', phone: '+58 416 3456789', debtUsd: 0.00, creditLimit: 200.00, lastBuy: 'Hoy', status: 'Solvente' },
  ]);

  const [search, setSearch] = useState('');
  const [alertSent, setAlertSent] = useState(null);

  const handleSendWhatsapp = (client) => {
    const debtBs = (client.debtUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const msg = `Hola estimado/a ${client.name}, le saludamos cordialmente de Comercial Los Andes. Le recordamos su saldo pendiente de $${client.debtUsd.toFixed(2)} USD (equivalente a Bs. ${debtBs} a la tasa oficial BCV de hoy). ¡Muchas gracias por su preferencia!`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=${encoded}`, '_blank');
    setAlertSent(client.name);
    setTimeout(() => setAlertSent(null), 3000);
  };

  const handlePay = (id) => {
    setClients(clients.map(c => c.id === id ? { ...c, debtUsd: 0, status: 'Solvente' } : c));
  };

  const totalDebt = clients.reduce((sum, c) => sum + c.debtUsd, 0);

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-neutral-950">Cartera de Clientes & Cuentas por Cobrar (Fiado)</h2>
          <p className="text-xs text-neutral-500">
            Control de límites de crédito y cobranza formal vía WhatsApp calculada a la tasa oficial BCV
          </p>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-neutral-400 uppercase font-semibold">Total por cobrar en calle</div>
          <div className="text-lg font-bold font-mono text-neutral-950">
            ${totalDebt.toFixed(2)} USD <span className="text-xs text-neutral-500 font-normal">/ Bs. {(totalDebt * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {alertSent && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Recordatorio de cobro por WhatsApp preparado para <strong>{alertSent}</strong>.</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente por nombre o teléfono celular..."
          className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950"
        />
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Teléfono WhatsApp</th>
                <th className="py-3 px-4">Límite Crédito</th>
                <th className="py-3 px-4">Deuda ($ USD)</th>
                <th className="py-3 px-4">Deuda en Bs (Tasa BCV)</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones de Cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-neutral-950">{client.name}</td>
                  <td className="py-3 px-4 text-neutral-500 font-mono">{client.phone}</td>
                  <td className="py-3 px-4 font-mono text-neutral-500">${client.creditLimit.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-neutral-950">
                    <span className={client.debtUsd > 0 ? 'text-amber-900' : 'text-neutral-400'}>
                      ${client.debtUsd.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-600 font-medium">
                    {client.debtUsd > 0 ? (
                      `Bs. ${(client.debtUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    ) : (
                      'Bs. 0.00'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      client.status === 'Solvente' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                        : client.status === 'Vencido'
                        ? 'bg-rose-50 text-rose-800 border-rose-200/60'
                        : 'bg-amber-50 text-amber-800 border-amber-200/60'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {client.debtUsd > 0 ? (
                      <>
                        <button
                          onClick={() => handleSendWhatsapp(client)}
                          className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Recordar WhatsApp
                        </button>
                        <button
                          onClick={() => handlePay(client.id)}
                          className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Liquidar
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-medium">Sin deuda</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
