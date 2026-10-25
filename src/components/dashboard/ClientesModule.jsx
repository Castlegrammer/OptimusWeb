import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Send, 
  Check, 
  DollarSign, 
  BookOpen, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Receipt, 
  Calendar, 
  X, 
  MessageCircle, 
  History, 
  UserPlus, 
  Clock, 
  Phone,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const STORAGE_KEY = 'optimus360_fiado_clients_v2';

// Datos iniciales de demostración si la libreta está vacía
const INITIAL_CLIENTS = [
  {
    id: 'CLI-01',
    name: 'Roberto Gómez',
    nickname: 'El del Taller Mecánico',
    phone: '+58 412 1234567',
    debtUsd: 28.50,
    creditLimit: 60.00,
    status: 'Al día',
    history: [
      { id: 'tx-1', date: '20 Oct 2026', time: '09:15 AM', type: 'fiado', desc: '2 Harinas PAN + 1 Aceite 1L', amountUsd: 5.50, paymentMethod: '-', balanceAfter: 5.50 },
      { id: 'tx-2', date: '21 Oct 2026', time: '04:30 PM', type: 'fiado', desc: '1 Paquete de Café + 1 Azúcar', amountUsd: 8.00, paymentMethod: '-', balanceAfter: 13.50 },
      { id: 'tx-3', date: '22 Oct 2026', time: '11:20 AM', type: 'abono', desc: 'Abono en efectivo en la bodega', amountUsd: 10.00, paymentMethod: 'Efectivo USD', balanceAfter: 3.50 },
      { id: 'tx-4', date: '23 Oct 2026', time: '06:10 PM', type: 'fiado', desc: 'Bulto de refrescos + hielo', amountUsd: 25.00, paymentMethod: '-', balanceAfter: 28.50 },
    ]
  },
  {
    id: 'CLI-02',
    name: 'Carmen Silva',
    nickname: 'Doña Carmen (Piso 2)',
    phone: '+58 414 7654321',
    debtUsd: 12.00,
    creditLimit: 30.00,
    status: 'Al día',
    history: [
      { id: 'tx-5', date: '19 Oct 2026', time: '10:00 AM', type: 'fiado', desc: 'Queso blanco 1kg + Cartón de huevos', amountUsd: 18.00, paymentMethod: '-', balanceAfter: 18.00 },
      { id: 'tx-6', date: '22 Oct 2026', time: '05:45 PM', type: 'abono', desc: 'Abono de quincena por Pago Móvil', amountUsd: 10.00, paymentMethod: 'Pago Móvil (BCV)', balanceAfter: 8.00 },
      { id: 'tx-7', date: '24 Oct 2026', time: '08:30 AM', type: 'fiado', desc: 'Pan canilla + Jamón', amountUsd: 4.00, paymentMethod: '-', balanceAfter: 12.00 },
    ]
  },
  {
    id: 'CLI-03',
    name: 'Carlos Rivas',
    nickname: 'El Catire de la Esquina',
    phone: '+58 424 9876543',
    debtUsd: 0.00,
    creditLimit: 50.00,
    status: 'Solvente',
    history: [
      { id: 'tx-8', date: '15 Oct 2026', time: '02:00 PM', type: 'fiado', desc: 'Artículos de limpieza', amountUsd: 15.00, paymentMethod: '-', balanceAfter: 15.00 },
      { id: 'tx-9', date: '18 Oct 2026', time: '09:00 AM', type: 'abono', desc: 'Pago total de su cuenta', amountUsd: 15.00, paymentMethod: 'Pago Móvil (BCV)', balanceAfter: 0.00 },
    ]
  },
  {
    id: 'CLI-04',
    name: 'María Eugenia Rivas',
    nickname: 'Profa. María',
    phone: '+58 416 3456789',
    debtUsd: 34.00,
    creditLimit: 40.00,
    status: 'Vencido',
    history: [
      { id: 'tx-10', date: '10 Oct 2026', time: '01:10 PM', type: 'fiado', desc: 'Víveres varios de fin de semana', amountUsd: 44.00, paymentMethod: '-', balanceAfter: 44.00 },
      { id: 'tx-11', date: '16 Oct 2026', time: '12:00 PM', type: 'abono', desc: 'Abono parcial', amountUsd: 10.00, paymentMethod: 'Efectivo Bs', balanceAfter: 34.00 },
    ]
  }
];

export default function ClientesModule({ bcvRate = 884.75, usdtRate = 1000.60 }) {
  // Carga inicial desde localStorage
  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error cargando libreta de fiado:', e);
    }
    return INITIAL_CLIENTS;
  });

  // Guardar cada cambio en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch (e) {
      console.error('Error guardando libreta de fiado:', e);
    }
  }, [clients]);

  const [search, setSearch] = useState('');

  // Modales
  const [selectedClientForPassbook, setSelectedClientForPassbook] = useState(null);
  const [clientForAbono, setClientForAbono] = useState(null);
  const [clientForFiado, setClientForFiado] = useState(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  // Estados del formulario de Abono
  const [abonoCurrency, setAbonoCurrency] = useState('USD'); // 'USD' | 'VES'
  const [abonoAmount, setAbonoAmount] = useState('');
  const [abonoMethod, setAbonoMethod] = useState('Pago Móvil (BCV)');
  const [abonoNote, setAbonoNote] = useState('');
  const [lastAbonoReceipt, setLastAbonoReceipt] = useState(null);

  // Estados del formulario de Anotar Fiado Rápido
  const [fiadoDesc, setFiadoDesc] = useState('');
  const [fiadoAmount, setFiadoAmount] = useState('');

  // Estados del formulario de Nuevo Cliente
  const [newName, setNewName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('50');
  const [newInitialDebt, setNewInitialDebt] = useState('0');

  // Notificación rápida
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. REGISTRAR ABONO (PAGO PARCIAL O TOTAL)
  const handleConfirmAbono = (e) => {
    e.preventDefault();
    if (!clientForAbono || !abonoAmount) return;

    const rawVal = parseFloat(abonoAmount) || 0;
    if (rawVal <= 0) return;

    // Convertir a USD si fue ingresado en Bs
    const amountInUsd = abonoCurrency === 'USD' 
      ? rawVal 
      : (rawVal / (bcvRate || 1));

    const client = clients.find(c => c.id === clientForAbono.id);
    if (!client) return;

    const newDebt = Math.max(0, client.debtUsd - amountInUsd);
    const newStatus = newDebt === 0 ? 'Solvente' : 'Al día';

    const now = new Date();
    const dateStr = now.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newTx = {
      id: `tx-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      type: 'abono',
      desc: abonoNote.trim() || 'Abono a la cuenta',
      amountUsd: amountInUsd,
      paymentMethod: abonoMethod,
      balanceAfter: newDebt
    };

    const updatedClients = clients.map(c => {
      if (c.id === client.id) {
        return {
          ...c,
          debtUsd: newDebt,
          status: newStatus,
          history: [newTx, ...(c.history || [])]
        };
      }
      return c;
    });

    setClients(updatedClients);

    // Preparar el recibo para compartir por WhatsApp
    const receiptData = {
      clientName: client.name,
      clientPhone: client.phone,
      amountAbonoUsd: amountInUsd,
      amountAbonoBs: amountInUsd * bcvRate,
      method: abonoMethod,
      remainingDebtUsd: newDebt,
      remainingDebtBs: newDebt * bcvRate,
      date: `${dateStr} ${timeStr}`
    };

    setLastAbonoReceipt(receiptData);
    setClientForAbono(null);
    setAbonoAmount('');
    setAbonoNote('');

    // Si la libreta estaba abierta, refrescarla
    if (selectedClientForPassbook && selectedClientForPassbook.id === client.id) {
      setSelectedClientForPassbook({
        ...client,
        debtUsd: newDebt,
        status: newStatus,
        history: [newTx, ...(client.history || [])]
      });
    }

    showToast(`¡Abono de $${amountInUsd.toFixed(2)} registrado para ${client.name}!`);
  };

  // 2. ANOTAR FIADO RÁPIDO ("SUMAR A LA CUENTA")
  const handleConfirmFiado = (e) => {
    e.preventDefault();
    if (!clientForFiado || !fiadoAmount) return;

    const amountInUsd = parseFloat(fiadoAmount) || 0;
    if (amountInUsd <= 0) return;

    const client = clients.find(c => c.id === clientForFiado.id);
    if (!client) return;

    const newDebt = client.debtUsd + amountInUsd;
    const newStatus = client.status === 'Solvente' ? 'Al día' : client.status;

    const now = new Date();
    const dateStr = now.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newTx = {
      id: `tx-${Date.now()}`,
      date: dateStr,
      time: timeStr,
      type: 'fiado',
      desc: fiadoDesc.trim() || 'Compra fiada en mostrador',
      amountUsd: amountInUsd,
      paymentMethod: '-',
      balanceAfter: newDebt
    };

    const updatedClients = clients.map(c => {
      if (c.id === client.id) {
        return {
          ...c,
          debtUsd: newDebt,
          status: newStatus,
          history: [newTx, ...(c.history || [])]
        };
      }
      return c;
    });

    setClients(updatedClients);
    setClientForFiado(null);
    setFiadoDesc('');
    setFiadoAmount('');

    if (selectedClientForPassbook && selectedClientForPassbook.id === client.id) {
      setSelectedClientForPassbook({
        ...client,
        debtUsd: newDebt,
        status: newStatus,
        history: [newTx, ...(client.history || [])]
      });
    }

    showToast(`Se anotaron $${amountInUsd.toFixed(2)} a la libreta de ${client.name}`);
  };

  // 3. REGISTRAR NUEVO CLIENTE / VECINO
  const handleCreateClient = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const initialDebt = parseFloat(newInitialDebt) || 0;
    const limit = parseFloat(newCreditLimit) || 50;

    const now = new Date();
    const dateStr = now.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newClient = {
      id: `CLI-0${clients.length + 1}`,
      name: newName.trim(),
      nickname: newNickname.trim() || 'Cliente de bodega',
      phone: newPhone.trim() || '+58 ',
      debtUsd: initialDebt,
      creditLimit: limit,
      status: initialDebt > 0 ? 'Al día' : 'Solvente',
      history: initialDebt > 0 ? [
        {
          id: `tx-${Date.now()}`,
          date: dateStr,
          time: timeStr,
          type: 'fiado',
          desc: 'Saldo anotado anterior (migración)',
          amountUsd: initialDebt,
          paymentMethod: '-',
          balanceAfter: initialDebt
        }
      ] : []
    };

    setClients([newClient, ...clients]);
    setShowNewClientModal(false);
    setNewName('');
    setNewNickname('');
    setNewPhone('');
    setNewCreditLimit('50');
    setNewInitialDebt('0');

    showToast(`Cliente ${newClient.name} agregado a la libreta.`);
  };

  // 4. GENERADORES DE WHATSAPP
  const sendWhatsappReminder = (client) => {
    const debtBs = (client.debtUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const msg = `Hola estimado/a ${client.name}, le saludamos cordialmente de la bodega. Le recordamos su saldo pendiente en la cuenta de $${client.debtUsd.toFixed(2)} USD (equivalente a Bs. ${debtBs} a la tasa oficial BCV de hoy). ¡Muchas gracias por su preferencia!`;
    window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const sendWhatsappReceipt = (receipt) => {
    const msg = `*COMPROBANTE DE ABONO - BODEGA*\n` +
      `Estimado/a ${receipt.clientName},\n\n` +
      `Confirmamos el registro de su abono con éxito:\n` +
      `• Monto abonado: $${receipt.amountAbonoUsd.toFixed(2)} USD (Bs. ${receipt.amountAbonoBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})\n` +
      `• Forma de pago: ${receipt.method}\n` +
      `• Fecha: ${receipt.date}\n\n` +
      (receipt.remainingDebtUsd <= 0
        ? `*¡Felicidades, su cuenta queda completamente SOLVENTE ($0.00)! Muchas gracias.*`
        : `*Saldo pendiente restante:* $${receipt.remainingDebtUsd.toFixed(2)} USD (Bs. ${receipt.remainingDebtBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} a tasa BCV).\n\n¡Gracias por su puntualidad!`);

    window.open(`https://wa.me/${receipt.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const sendWhatsappPassbookSummary = (client) => {
    const debtBs = (client.debtUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    let text = `*ESTADO DE CUENTA - LA LIBRETA DIGITAL*\nCliente: ${client.name} (${client.nickname})\n\n`;
    text += `*Saldo actual por pagar:* $${client.debtUsd.toFixed(2)} USD (Bs. ${debtBs} a tasa BCV Bs. ${bcvRate.toFixed(2)})\n\n`;
    text += `*Últimos movimientos anotados:*\n`;

    const recent = (client.history || []).slice(0, 5);
    recent.forEach((tx) => {
      const sign = tx.type === 'abono' ? 'ABONÓ (-)' : 'FIÓ (+)';
      text += `• ${tx.date}: ${sign} $${tx.amountUsd.toFixed(2)} [${tx.desc}]\n`;
    });

    text += `\n¡Gracias por su confianza!`;
    window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Métricas rápidas
  const totalDebtUsd = clients.reduce((sum, c) => sum + c.debtUsd, 0);
  const totalClientsWithDebt = clients.filter(c => c.debtUsd > 0).length;

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.nickname && c.nickname.toLowerCase().includes(search.toLowerCase())) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      
      {/* Toast Notificación */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs border border-neutral-800 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-950">Sistema de Fiado & Libreta de Bodega</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              Historial de Abonos
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Lleva el control exacto de quién te debe, cuánto ha ido abonando y manda recibos claros por WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNewClientModal(true)}
            className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Vecino / Cliente</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen Rápido de la Bodega */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Fiado en la Calle */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total Fiado en Calle (Por cobrar)</span>
            <Wallet className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-neutral-950 mt-1.5">
            ${totalDebtUsd.toFixed(2)} <span className="text-xs font-normal text-neutral-400">USD</span>
          </div>
          <div className="text-xs font-mono text-emerald-700 font-semibold mt-0.5">
            Bs. {(totalDebtUsd * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 2 })} VES (Tasa BCV)
          </div>
        </div>

        {/* Clientes con cuenta abierta */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Cuentas con Deuda Activa</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-neutral-950 mt-1.5">
            {totalClientsWithDebt} <span className="text-xs font-normal text-neutral-400">vecinos debiendo</span>
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            De un total de {clients.length} clientes registrados
          </div>
        </div>

        {/* Tasa Oficial de Cobro */}
        <div className="bg-neutral-950 text-white p-4 sm:p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Tasa de Conversión Oficial</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-1.5">
            Bs. {bcvRate.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            Los abonos en Bolívares se descuentan a esta tasa
          </div>
        </div>

      </div>

      {/* Alerta de último recibo generado listo para WhatsApp */}
      {lastAbonoReceipt && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold">
                ¡Abono registrado con éxito para {lastAbonoReceipt.clientName}!
              </div>
              <div className="text-emerald-800">
                Abonó <strong>${lastAbonoReceipt.amountAbonoUsd.toFixed(2)}</strong> vía {lastAbonoReceipt.method}. Saldo restante: <strong>${lastAbonoReceipt.remainingDebtUsd.toFixed(2)} USD</strong>.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => sendWhatsappReceipt(lastAbonoReceipt)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Enviar Recibo al WhatsApp</span>
            </button>
            <button
              onClick={() => setLastAbonoReceipt(null)}
              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100"
              title="Ocultar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, apodo (ej. Doña Carmen, Taller) o teléfono..."
          className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950 shadow-2xs"
        />
      </div>

      {/* Tabla Principal de Clientes y Libreta */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Vecino / Cliente</th>
                <th className="py-3 px-4">Teléfono WhatsApp</th>
                <th className="py-3 px-4">Saldo Deuda ($ USD)</th>
                <th className="py-3 px-4">Equivalente en Bs (BCV)</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Operaciones de Fiado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-neutral-400">
                    No se encontraron clientes con ese nombre o apodo.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const hasDebt = client.debtUsd > 0;
                  const recentCount = (client.history || []).length;

                  return (
                    <tr key={client.id} className="hover:bg-neutral-50/70 transition-colors">
                      
                      {/* Cliente y Apodo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            hasDebt ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {client.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-950 flex items-center gap-1.5">
                              <span>{client.name}</span>
                              {client.nickname && (
                                <span className="text-[10px] text-neutral-500 font-normal">
                                  ({client.nickname})
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => setSelectedClientForPassbook(client)}
                              className="text-[10px] text-neutral-500 hover:text-neutral-950 font-medium flex items-center gap-1 mt-0.5"
                            >
                              <BookOpen className="w-3 h-3 text-neutral-400" />
                              <span>Ver libreta ({recentCount} movs)</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Teléfono */}
                      <td className="py-3.5 px-4 font-mono text-neutral-600">
                        {client.phone}
                      </td>

                      {/* Deuda USD */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`font-bold text-sm ${hasDebt ? 'text-amber-950' : 'text-neutral-400'}`}>
                          ${client.debtUsd.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-neutral-400">
                          Límite: ${client.creditLimit.toFixed(2)}
                        </div>
                      </td>

                      {/* Deuda en Bolívares */}
                      <td className="py-3.5 px-4 font-mono text-neutral-700 font-medium">
                        {hasDebt ? (
                          <span className="text-neutral-900 font-semibold">
                            Bs. {(client.debtUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-neutral-400">Bs. 0.00</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          client.status === 'Solvente' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                            : client.status === 'Vencido'
                            ? 'bg-rose-50 text-rose-800 border-rose-200/60'
                            : 'bg-amber-50 text-amber-800 border-amber-200/60'
                        }`}>
                          {client.status}
                        </span>
                      </td>

                      {/* Acciones Rápidas */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Botón Ver Libreta */}
                          <button
                            onClick={() => setSelectedClientForPassbook(client)}
                            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition-colors"
                            title="Abrir libreta del cliente"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>

                          {/* Botón Anotar Fiado (+) */}
                          <button
                            onClick={() => setClientForFiado(client)}
                            className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                            title="Anotar algo a su cuenta"
                          >
                            <Plus className="w-3 h-3 text-amber-600" />
                            <span>Fiar</span>
                          </button>

                          {/* Botón Registrar Abono (-) */}
                          {hasDebt && (
                            <button
                              onClick={() => setClientForAbono(client)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                              title="Registrar abono de dinero"
                            >
                              <ArrowDownLeft className="w-3 h-3" />
                              <span>Abonar</span>
                            </button>
                          )}

                          {/* Botón Recordar por WhatsApp */}
                          {hasDebt && (
                            <button
                              onClick={() => sendWhatsappReminder(client)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                              title="Enviar recordatorio formal por WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: LA LIBRETA DIGITAL DEL CLIENTE (HISTORIAL DE ABONOS) */}
      {/* ========================================================= */}
      {selectedClientForPassbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white w-full max-w-2xl rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera de la Libreta */}
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-bold text-sm">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-950">
                      Libreta de Cuentas: {selectedClientForPassbook.name}
                    </h3>
                    <span className="text-xs text-neutral-400 font-normal">
                      {selectedClientForPassbook.nickname}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    Teléfono: {selectedClientForPassbook.phone}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedClientForPassbook(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen del Saldo Actual del Cliente */}
            <div className="p-5 bg-neutral-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
                  Saldo Adeudado a la Fecha:
                </span>
                <div className="text-3xl font-mono font-bold text-emerald-400 mt-0.5">
                  ${selectedClientForPassbook.debtUsd.toFixed(2)} <span className="text-sm font-normal text-white">USD</span>
                </div>
                <div className="text-xs text-neutral-300 font-mono mt-0.5">
                  Equivale a: <strong>Bs. {(selectedClientForPassbook.debtUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> (BCV: Bs. {bcvRate.toFixed(2)})
                </div>
              </div>

              {/* Botones de acción rápida dentro de la libreta */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setClientForFiado(selectedClientForPassbook);
                  }}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-700"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Anotar Fiado</span>
                </button>

                <button
                  onClick={() => {
                    setClientForAbono(selectedClientForPassbook);
                  }}
                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-neutral-950" />
                  <span>- Registrar Abono</span>
                </button>
              </div>
            </div>

            {/* Historial detallado de movimientos (La Libreta Fiel) */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Historial de Fiados y Pagos (Cronológico):</span>
                </h4>

                <button
                  onClick={() => sendWhatsappPassbookSummary(selectedClientForPassbook)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Enviar Estado al WhatsApp</span>
                </button>
              </div>

              {(!selectedClientForPassbook.history || selectedClientForPassbook.history.length === 0) ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  Este cliente no tiene movimientos registrados aún.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedClientForPassbook.history.map((tx) => {
                    const isAbono = tx.type === 'abono';

                    return (
                      <div 
                        key={tx.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isAbono 
                            ? 'bg-emerald-50/50 border-emerald-200/70' 
                            : 'bg-white border-neutral-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isAbono ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isAbono ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  isAbono ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {isAbono ? 'ABONÓ (-)' : 'FIÓ (+)'}
                                </span>
                                <span className="text-xs font-semibold text-neutral-900">
                                  {tx.desc}
                                </span>
                              </div>

                              <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-2">
                                <span>{tx.date} • {tx.time}</span>
                                {tx.paymentMethod && tx.paymentMethod !== '-' && (
                                  <>
                                    <span>•</span>
                                    <span className="font-medium text-neutral-600">Método: {tx.paymentMethod}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className={`font-mono font-bold text-sm ${
                              isAbono ? 'text-emerald-700' : 'text-neutral-900'
                            }`}>
                              {isAbono ? '-' : '+'}${tx.amountUsd.toFixed(2)} USD
                            </div>
                            <div className="text-[10px] font-mono text-neutral-400">
                              Saldo tras mov: ${tx.balanceAfter.toFixed(2)}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pie de la Libreta */}
            <div className="px-5 py-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                Límite de fiado asignado: ${selectedClientForPassbook.creditLimit.toFixed(2)} USD
              </span>
              <button
                onClick={() => setSelectedClientForPassbook(null)}
                className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800"
              >
                Listo
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: REGISTRAR ABONO (PAGO DE DINERO) */}
      {/* ========================================================= */}
      {clientForAbono && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white w-full max-w-md rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleConfirmAbono}>
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-emerald-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-950">Registrar Abono</h3>
                    <p className="text-[11px] text-neutral-500">Cliente: <strong>{clientForAbono.name}</strong></p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setClientForAbono(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                
                {/* Deuda actual */}
                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Deuda actual en libreta:</span>
                  <div className="text-right">
                    <div className="font-mono font-bold text-base text-neutral-950">${clientForAbono.debtUsd.toFixed(2)} USD</div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      Bs. {(clientForAbono.debtUsd * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 2 })} (BCV)
                    </div>
                  </div>
                </div>

                {/* Moneda y Monto del Abono */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-neutral-700">Monto del Abono:</label>
                    <div className="flex rounded-lg border border-neutral-200 bg-white p-0.5 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setAbonoCurrency('USD')}
                        className={`px-2 py-0.5 rounded-md ${abonoCurrency === 'USD' ? 'bg-neutral-950 text-white' : 'text-neutral-600'}`}
                      >
                        $ USD
                      </button>
                      <button
                        type="button"
                        onClick={() => setAbonoCurrency('VES')}
                        className={`px-2 py-0.5 rounded-md ${abonoCurrency === 'VES' ? 'bg-neutral-950 text-white' : 'text-neutral-600'}`}
                      >
                        Bs. VES
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      autoFocus
                      value={abonoAmount}
                      onChange={(e) => setAbonoAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-neutral-950 focus:outline-none focus:border-neutral-950"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">
                      {abonoCurrency}
                    </span>
                  </div>

                  {/* Botón para pagar la totalidad */}
                  <div className="mt-1.5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (abonoCurrency === 'USD') {
                          setAbonoAmount(clientForAbono.debtUsd.toString());
                        } else {
                          setAbonoAmount((clientForAbono.debtUsd * bcvRate).toFixed(2));
                        }
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold underline"
                    >
                      Pagar deuda total (${clientForAbono.debtUsd.toFixed(2)})
                    </button>
                  </div>
                </div>

                {/* Método de pago */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Método con el que abonó:</label>
                  <select
                    value={abonoMethod}
                    onChange={(e) => setAbonoMethod(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                  >
                    <option value="Pago Móvil (BCV)">Pago Móvil (Tasa BCV)</option>
                    <option value="Efectivo Divisas ($ USD)">Efectivo Divisas ($ USD)</option>
                    <option value="Efectivo Bolívares">Efectivo Bolívares (Bs)</option>
                    <option value="Punto de Venta Débito">Punto de Venta Débito</option>
                    <option value="USDT Binance">USDT Binance P2P</option>
                  </select>
                </div>

                {/* Nota o Concepto */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Nota / Concepto (Opcional):</label>
                  <input
                    type="text"
                    value={abonoNote}
                    onChange={(e) => setAbonoNote(e.target.value)}
                    placeholder="Ej. Abono quincena, dejó 5$ con el hijo..."
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                  />
                </div>

              </div>

              <div className="px-5 py-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClientForAbono(null)}
                  className="px-3.5 py-2 border border-neutral-300 rounded-xl text-neutral-700 font-semibold text-xs hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Guardar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ANOTAR FIADO RÁPIDO ("SUMAR AL SALDO") */}
      {/* ========================================================= */}
      {clientForFiado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white w-full max-w-md rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleConfirmFiado}>
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-amber-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-950">Anotar Fiado a la Cuenta</h3>
                    <p className="text-[11px] text-neutral-500">Cliente: <strong>{clientForFiado.name}</strong></p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setClientForFiado(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    ¿Qué se llevó fiado? (Productos o concepto):
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={fiadoDesc}
                    onChange={(e) => setFiadoDesc(e.target.value)}
                    placeholder="Ej. 1 Harina PAN + 1 Mantequilla + 1 Arroz"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Monto total a cargar ($ USD):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-neutral-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={fiadoAmount}
                      onChange={(e) => setFiadoAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-neutral-300 rounded-xl pl-7 pr-3 py-2.5 text-base font-mono font-bold text-neutral-950 focus:outline-none focus:border-neutral-950"
                    />
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-1">
                    Equivale a Bs. {((parseFloat(fiadoAmount) || 0) * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 2 })} a tasa BCV
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600">
                  Deuda actual: <strong>${clientForFiado.debtUsd.toFixed(2)}</strong> ➔ Nueva deuda estimada:{' '}
                  <strong className="text-amber-950 font-mono font-bold">
                    ${(clientForFiado.debtUsd + (parseFloat(fiadoAmount) || 0)).toFixed(2)} USD
                  </strong>
                </div>

              </div>

              <div className="px-5 py-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClientForFiado(null)}
                  className="px-3.5 py-2 border border-neutral-300 rounded-xl text-neutral-700 font-semibold text-xs hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Sumar a la Libreta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: NUEVO VECINO / CLIENTE */}
      {/* ========================================================= */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white w-full max-w-md rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleCreateClient}>
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-950 text-white flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-950">Nuevo Vecino / Cliente</h3>
                    <p className="text-[11px] text-neutral-500">Agrega a un cliente a la libreta de la bodega</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Nombre Completo:</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej. Roberto Gómez"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Apodo o Referencia:</label>
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    placeholder="Ej. Doña Carmen piso 2, El Mecánico..."
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Número de WhatsApp (con código):</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+58 412 1234567"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-neutral-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Límite de Fiado ($ USD):</label>
                    <input
                      type="number"
                      step="1"
                      value={newCreditLimit}
                      onChange={(e) => setNewCreditLimit(e.target.value)}
                      placeholder="50"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-neutral-950"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Deuda Inicial ($ USD):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInitialDebt}
                      onChange={(e) => setNewInitialDebt(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-neutral-950"
                    />
                  </div>
                </div>

              </div>

              <div className="px-5 py-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-3.5 py-2 border border-neutral-300 rounded-xl text-neutral-700 font-semibold text-xs hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Guardar Vecino
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
