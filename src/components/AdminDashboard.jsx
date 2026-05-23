import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, FileText, Check, Trash2, X, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboard({ pets, onApprovePet, onRejectPet, onRemovePet }) {
  const { reports, logs, deleteListingReport, addLog } = useAuth();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('moderation');

  // Filter listings
  const approvedPets = pets.filter((p) => p.status === 'approved');
  const flaggedPets = pets.filter((p) => p.status === 'flagged');
  const activeCount = approvedPets.length;

  const handleApprove = (petId, petName) => {
    onApprovePet(petId);
    addLog('Admin Approved', `Admin approved listing '${petName}' to public grid.`);
  };

  const handleReject = (petId, petName, isFlagged) => {
    onRejectPet(petId);
    addLog('Admin Deleted', `Admin deleted ${isFlagged ? 'flagged spam' : 'active'} listing '${petName}'.`);
  };

  const handleResolveReport = (reportId, action, petId, petName) => {
    if (action === 'delete') {
      onRemovePet(petId);
      addLog('Admin Report Action', `Deleted reported listing '${petName}' due to policy violation.`);
    } else {
      addLog('Admin Report Action', `Dismissed abuse report on listing '${petName}'.`);
    }
    deleteListingReport(reportId);
  };

  const translateReportReason = (reason) => {
    if (language === 'fr') {
      switch (reason) {
        case 'Commercial Breeder / Selling': return 'Éleveur commercial / Vente';
        case 'Tried to charge adoption fees': return 'A tenté de facturer des frais';
        case 'Suspicious listing / Scammer': return 'Annonce suspecte / Arnaque';
        case 'Inappropriate / abusive photos': return 'Photos inappropriées / abusives';
        default: return reason;
      }
    }
    if (language === 'ar') {
      switch (reason) {
        case 'Commercial Breeder / Selling': return 'مربي تجاري / بيع';
        case 'Tried to charge adoption fees': return 'حاول فرض رسوم تبني';
        case 'Suspicious listing / Scammer': return 'إعلان مشبوه / احتيال';
        case 'Inappropriate / abusive photos': return 'صور غير لائقة / مسيئة';
        default: return reason;
      }
    }
    return reason;
  };

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto text-start scroll-mt-24 font-sans" id="admin-dashboard">
      <div className="bg-slate-900 text-slate-100 rounded-[32px] p-6 sm:p-10 shadow-2xl border border-slate-800 relative select-text">
        
        {/* Header Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4 text-start">
          <div className="flex items-center gap-3 text-start">
            <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-slate-900 shadow-lg shadow-secondary/15 shrink-0">
              <ShieldCheck className="w-6 h-6 fill-current" />
            </div>
            <div className="text-start">
              <h2 className="text-2xl font-extrabold tracking-tight text-white font-sans text-start">
                {t('admin.title')}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 text-start">
                {t('admin.subtitle')}
              </p>
            </div>
          </div>

          {/* Quick Active Badge */}
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 text-xs font-bold text-emerald-400 self-start shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t('admin.activeSync')}</span>
          </div>
        </div>

        {/* STATS COUNT GRID CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-start">
          {/* Active */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 text-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-start">{t('admin.statsActive')}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-white">{activeCount}</span>
              <span className="text-[10px] text-emerald-400 font-bold">{t('admin.statsActiveLabel')}</span>
            </div>
          </div>

          {/* Total Listings */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 text-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-start">{t('admin.statsPending')}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-amber-400">{pets.length}</span>
              <span className="text-[10px] text-amber-400 font-bold">{t('admin.statsPendingLabel')}</span>
            </div>
          </div>

          {/* Flagged Spam */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 text-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-start">{t('admin.statsSpam')}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-red-400">{flaggedPets.length}</span>
              <span className="text-[10px] text-red-400 font-bold">{t('admin.statsSpamLabel')}</span>
            </div>
          </div>

          {/* Abuse Reports */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 text-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-start">{t('admin.statsReports')}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-purple-400">{reports.length}</span>
              <span className="text-[10px] text-purple-400 font-bold">{t('admin.statsReportsLabel')}</span>
            </div>
          </div>
        </div>

        {/* MAIN PANEL TABS NAVIGATION */}
        <div className="flex flex-wrap border-b border-slate-800 mb-6 gap-2 text-start">
          {[
            { id: 'moderation', label: t('admin.tabMod', { count: approvedPets.length + flaggedPets.length }), icon: ShieldCheck },
            { id: 'reports', label: t('admin.tabRep', { count: reports.length }), icon: ShieldAlert },
            { id: 'audit', label: t('admin.tabAudit', { count: logs.length }), icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-bold transition-all cursor-pointer border-b-2 ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-secondary'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div>
          {/* TAB 1: MODERATION QUEUE */}
          {activeTab === 'moderation' && (
            <div className="space-y-4 text-start">
              {approvedPets.length === 0 && flaggedPets.length === 0 ? (
                <div className="text-center py-10 bg-slate-800/20 rounded-2xl border border-slate-800/50 text-center flex flex-col items-center">
                  <Check className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-300 text-center">{t('admin.queueEmpty')}</p>
                  <p className="text-xs text-slate-400 mt-1 text-center">{t('admin.queueEmptyDesc')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
                  {/* Map over flagged spam first (highest priority) */}
                  {[...flaggedPets, ...approvedPets].map((pet) => {
                    const isSpam = pet.status === 'flagged';
                    return (
                      <div
                        key={pet.id}
                        className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all bg-slate-800/20 text-start ${
                          isSpam ? 'border-red-500/30' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex gap-4 text-start">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                            <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-start">
                            <div className="flex items-center gap-1.5 flex-wrap text-start">
                              <span className="font-extrabold text-white text-base leading-tight text-start">{pet.name}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                isSpam ? 'bg-red-500/10 text-red-300 border-red-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              }`}>
                                {isSpam ? t('admin.spamBadge') : t('admin.pendingBadge')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-semibold mt-1 text-start">
                              {pet.breed} • {pet.age} • 📍{pet.location}
                            </p>
                            <p className="text-[11px] text-slate-300 line-clamp-2 mt-2 leading-relaxed italic bg-slate-900/40 p-2 rounded-lg text-start">
                              "{pet.description}"
                            </p>
                          </div>
                        </div>

                        {/* Audit Alerts */}
                        {isSpam && (
                          <div className="bg-red-950/20 text-red-400 border border-red-500/15 p-2 rounded-xl text-[10px] leading-relaxed flex items-center gap-1.5 text-start">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                            <span>{t('admin.autoFlagAlert')}</span>
                          </div>
                        )}

                        {/* Control buttons */}
                        <div className="flex items-center gap-2 border-t border-slate-800 pt-3.5 mt-1 text-start">
                          {isSpam && (
                            <button
                              onClick={() => handleApprove(pet.id, pet.name)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{t('admin.approveBtn')}</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleReject(pet.id, pet.name, isSpam)}
                            className="bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors ltr:ml-auto rtl:mr-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t('admin.rejectBtn')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ABUSE REPORTS BOARD */}
          {activeTab === 'reports' && (
            <div className="space-y-4 text-start">
              {reports.length === 0 ? (
                <div className="text-center py-10 bg-slate-800/20 rounded-2xl border border-slate-800/50 text-center flex flex-col items-center">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-300 text-center">{t('admin.reportsEmpty')}</p>
                  <p className="text-xs text-slate-400 mt-1 text-center">{t('admin.reportsEmptyDesc')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto text-start">
                  <table className="w-full text-xs text-slate-300 border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 text-start">
                    <thead className="bg-slate-800/60 uppercase font-bold text-slate-400 text-start">
                      <tr>
                        <th className="p-4 text-start">{t('admin.thPet')}</th>
                        <th className="p-4 text-start">{t('admin.thCategory')}</th>
                        <th className="p-4 text-start">{t('admin.thDetails')}</th>
                        <th className="p-4 text-center">{t('admin.thActions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-start">
                      {reports.map((rep) => {
                        const petReportsCount = reports.filter((r) => r.petId === rep.petId).length;
                        return (
                          <tr key={rep.id} className="hover:bg-slate-800/20">
                            <td className="p-4 text-start">
                              <span className="font-bold text-white text-sm block">{rep.petName}</span>
                              {rep.reporterEmail && (
                                <span className="text-[10px] text-slate-400 block mt-0.5 select-all">📧 {rep.reporterEmail}</span>
                              )}
                              <span className="inline-flex items-center text-[9px] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md mt-1.5 select-none">
                                📈 {petReportsCount} / 10
                              </span>
                            </td>
                            <td className="p-4 text-start">
                            <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-bold text-start">
                              {translateReportReason(rep.reason)}
                            </span>
                          </td>
                          <td className="p-4 leading-relaxed max-w-sm italic text-start">"{rep.details}"</td>
                          <td className="p-4 text-center flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleResolveReport(rep.id, 'delete', rep.petId, rep.petName)}
                              className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer"
                              title="Delete listing permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResolveReport(rep.id, 'dismiss', rep.petId, rep.petName)}
                              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                              title="Dismiss flag"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SYSTEM AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-4 text-start">
              <div data-lenis-prevent className="max-h-[350px] overflow-y-auto border border-slate-800 rounded-2xl p-4 bg-slate-950/40 space-y-2 text-start">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">{t('admin.sysLogsEmpty')}</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="text-xs font-mono py-2.5 px-3 rounded-xl border border-slate-800/40 bg-slate-900/30 flex items-start justify-between gap-4 hover:bg-slate-900/50 transition-all text-start">
                      <div className="flex items-start gap-3 text-start">
                        <span className="text-secondary shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className="text-emerald-400 font-bold shrink-0">{log.action}:</span>
                        <span className="text-slate-300 leading-relaxed text-start">{log.details}</span>
                      </div>
                      <span className="text-slate-500 text-[10px] shrink-0 font-bold select-none uppercase">{t('admin.logTimeLabel')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
