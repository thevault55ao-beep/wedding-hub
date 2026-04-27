import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://jpzdqesvwmessqgmyznw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwemRxZXN2d21lc3NxZ215em53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNDU5NjMsImV4cCI6MjA5MjgyMTk2M30.ICCI988CO3QR3qiOxhchXOt4ueM9N7frbgEooGhcZU0";

const db = {
  async get(table) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=id`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    return r.json();
  },
  async getOne(table) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.1`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    const d = await r.json();
    return d[0] || null;
  },
  async upsert(table, data) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify(data)
    });
  },
  async delete(table, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
  },
  async patch(table, id, data) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }
};

const WEDDING_DATE = new Date("2026-09-17T12:00:00");
const LOCATION = "Urbanização Nova Vida, Rua 184 nº 721C, Luanda, Angola";

const ROLES = {
  admin:       { label: "Admin — Whitney",          pin: "0000" },
  groom:       { label: "Groom — Fernando",         pin: "1234" },
  bridesmaids: { label: "Bridesmaids / Madrinhas",  pin: "2222" },
  godparents:  { label: "Godparents / Padrinhos",   pin: "3333" },
};

const ACCESS = {
  admin:       ["dashboard","schedule","location","decor","buffet","suppliers","budget","guests","documents"],
  groom:       ["dashboard","schedule","location","suppliers","budget"],
  bridesmaids: ["dashboard","decor","schedule","buffet","suppliers"],
  godparents:  ["dashboard","schedule","location"],
};

const EDIT_ACCESS = {
  admin:       ["schedule","location","decor","buffet","suppliers","budget","guests","documents"],
  groom:       ["budget","suppliers"],
  bridesmaids: ["decor","buffet"],
  godparents:  [],
};

const SECTIONS = {
  dashboard:  { label:{ pt:"Início",       en:"Home"      } },
  schedule:   { label:{ pt:"Cronograma",   en:"Schedule"  } },
  location:   { label:{ pt:"Local",        en:"Location"  } },
  decor:      { label:{ pt:"Decoração",    en:"Decor"     } },
  buffet:     { label:{ pt:"Buffet",       en:"Buffet"    } },
  suppliers:  { label:{ pt:"Fornecedores", en:"Suppliers" } },
  budget:     { label:{ pt:"Orçamento",    en:"Budget"    } },
  guests:     { label:{ pt:"Convidados",   en:"Guests"    } },
  documents:  { label:{ pt:"Documentos",   en:"Documents" } },
};

function useCountdown() {
  const [time, setTime] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = WEDDING_DATE - new Date();
      if (diff <= 0) return setTime({ days:0, hours:0, minutes:0, seconds:0 });
      setTime({ days:Math.floor(diff/86400000), hours:Math.floor((diff%86400000)/3600000), minutes:Math.floor((diff%3600000)/60000), seconds:Math.floor((diff%60000)/1000) });
    };
    calc(); const id = setInterval(calc,1000); return () => clearInterval(id);
  },[]);
  return time;
}

/* ─── APP ─── */
export default function WeddingHub() {
  const [lang, setLang]         = useState("pt");
  const [role, setRole]         = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinRole, setPinRole]   = useState("admin");
  const [pinError, setPinError] = useState(false);
  const [section, setSection]   = useState("dashboard");
  const [slim, setSlim]         = useState(false);
  const countdown               = useCountdown();

  const t       = (pt, en) => lang === "pt" ? pt : en;
  const canEdit = (sec)    => role && EDIT_ACCESS[role]?.includes(sec);

  const login = () => {
    if (ROLES[pinRole].pin === pinInput) { setRole(pinRole); setPinError(false); setSection("dashboard"); }
    else { setPinError(true); setTimeout(() => setPinError(false), 1400); }
  };

  if (!role) return <Login pinRole={pinRole} setPinRole={setPinRole} pinInput={pinInput} setPinInput={setPinInput} pinError={pinError} login={login} t={t} />;

  const allowed = ACCESS[role];

  return (
    <div style={S.app}>
      <GStyles />
      <aside style={{ ...S.sidebar, width: slim ? "58px" : "230px" }}>
        <div style={S.sbTop}>
          {!slim && <div style={S.sbBrand}><div style={S.sbNames}>F &amp; W</div><div style={S.sbDate}>17 · IX · 2026</div></div>}
          <button onClick={() => setSlim(s=>!s)} style={S.slimBtn}>{slim?"»":"«"}</button>
        </div>
        <nav style={S.nav}>
          {Object.entries(SECTIONS).filter(([k]) => allowed.includes(k)).map(([k,v],i) => (
            <button key={k} onClick={() => setSection(k)} title={v.label[lang]}
              style={{ ...S.navItem, ...(section===k?S.navOn:{}), animationDelay:`${i*35}ms` }}>
              <span style={S.navIdx}>{String(i+1).padStart(2,"0")}</span>
              {!slim && <span style={S.navTxt}>{v.label[lang]}</span>}
            </button>
          ))}
        </nav>
        <div style={S.sbFoot}>
          <button onClick={() => setLang(l => l==="pt"?"en":"pt")} style={S.footBtn}>{lang==="pt"?"EN":"PT"}</button>
          {!slim && <button onClick={() => setRole(null)} style={S.footBtn}>{t("Sair","Exit")}</button>}
        </div>
      </aside>

      <main style={S.main}>
        {section==="dashboard"  && <Dashboard  countdown={countdown} t={t} />}
        {section==="schedule"   && <Schedule   canEdit={canEdit("schedule")}   t={t} />}
        {section==="location"   && <Location   canEdit={canEdit("location")}   t={t} />}
        {section==="decor"      && <Decor      canEdit={canEdit("decor")}      t={t} />}
        {section==="buffet"     && <Buffet     canEdit={canEdit("buffet")}     t={t} />}
        {section==="suppliers"  && <Suppliers  canEdit={canEdit("suppliers")}  t={t} />}
        {section==="budget"     && <Budget     canEdit={canEdit("budget")}     t={t} />}
        {section==="guests"     && <Guests     canEdit={canEdit("guests")}     t={t} />}
        {section==="documents"  && <Documents  canEdit={canEdit("documents")}  t={t} />}
      </main>
    </div>
  );
}

/* ─── LOGIN ─── */
function Login({ pinRole, setPinRole, pinInput, setPinInput, pinError, login, t }) {
  return (
    <div style={S.loginBg}>
      <GStyles />
      <div style={S.loginCard}>
        <div style={S.loginEye}>WEDDING PLANNING HUB</div>
        <div style={S.loginNames}>Fernando<br/><em style={S.loginAmp}>&amp;</em><br/>Whitney</div>
        <div style={S.loginWhen}>17 · IX · 2026 · Luanda, Angola</div>
        <div style={S.loginRule}/>
        <div style={S.loginFL}>{t("Entrar como","Sign in as")}</div>
        <select value={pinRole} onChange={e=>setPinRole(e.target.value)} style={S.loginSel}>
          {Object.entries(ROLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input type="password" placeholder={t("PIN de acesso","Access PIN")} value={pinInput}
          onChange={e=>setPinInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
          style={{ ...S.loginPin, ...(pinError?S.loginPinErr:{}) }}/>
        <button onClick={login} style={S.loginBtn}>{t("ENTRAR","ENTER")}</button>
        <div style={S.loginHint}>{t("Admin PIN: 0000","Admin PIN: 0000")}</div>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ─── */
function Dashboard({ countdown, t }) {
  const [stats, setStats] = useState({ budget:0, paid:0, guests:0, confirmed:0, suppliers:0, suppConfirmed:0, events:0 });

  useEffect(() => {
    Promise.all([db.get("budget"), db.get("guests"), db.get("suppliers"), db.get("schedule")]).then(([budget, guests, suppliers, schedule]) => {
      setStats({
        budget: budget.reduce((s,b)=>s+Number(b.estimated),0),
        paid: budget.reduce((s,b)=>s+(b.paid?Number(b.actual||b.estimated):0),0),
        guests: guests.length,
        confirmed: guests.filter(g=>g.confirmed).length,
        suppliers: suppliers.length,
        suppConfirmed: suppliers.filter(s=>s.status==="confirmed").length,
        events: schedule.length,
      });
    });
  }, []);

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <div style={S.heroEye}>LUANDA · ANGOLA · 2026</div>
        <h1 style={S.heroH1}>Fernando<br/><em style={S.heroAmp}>&amp;</em><br/>Whitney</h1>
        <div style={S.heroSub}>17 de Setembro de 2026</div>
      </div>
      <div style={S.cdRow}>
        {[{v:countdown.days,l:t("DIAS","DAYS")},{v:countdown.hours,l:t("HORAS","HRS")},{v:countdown.minutes,l:"MIN"},{v:countdown.seconds,l:t("SEG","SEC")}].map((c,i)=>(
          <div key={i} style={S.cdBox}>
            <div style={S.cdNum}>{String(c.v??0).padStart(2,"0")}</div>
            <div style={S.cdLbl}>{c.l}</div>
          </div>
        ))}
      </div>
      <div style={S.statsGrid}>
        {[
          { l:t("ORÇAMENTO","BUDGET"),      v:`${stats.budget.toLocaleString()} Kz`, s:`${stats.paid.toLocaleString()} Kz ${t("pago","paid")}` },
          { l:t("CONVIDADOS","GUESTS"),      v:stats.guests,   s:`${stats.confirmed} ${t("confirmados","confirmed")}` },
          { l:t("FORNECEDORES","SUPPLIERS"), v:stats.suppliers, s:`${stats.suppConfirmed} ${t("confirmados","confirmed")}` },
          { l:t("EVENTOS","EVENTS"),         v:stats.events,   s:t("no cronograma","in schedule") },
        ].map((c,i)=>(
          <div key={i} style={S.statBox}>
            <div style={S.statL}>{c.l}</div>
            <div style={S.statV}>{c.v}</div>
            <div style={S.statS}>{c.s}</div>
          </div>
        ))}
      </div>
      <div style={S.locBanner}>
        <div style={S.locBannerL}>{t("LOCAL DA CERIMÓNIA","CEREMONY VENUE")}</div>
        <div style={S.locBannerA}>{LOCATION}</div>
      </div>
    </div>
  );
}

/* ─── SCHEDULE ─── */
function Schedule({ canEdit, t }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { db.get("schedule").then(d => { setRows(d); setLoading(false); }); }, []);

  const add = async () => {
    const row = { id: Date.now(), time: "", event: "", note: "", sort_order: rows.length + 1 };
    await db.upsert("schedule", row);
    setRows(r => [...r, row]);
  };

  const remove = async (id) => {
    await db.delete("schedule", id);
    setRows(r => r.filter(x => x.id !== id));
  };

  const upd = async (id, f, v) => {
    setRows(r => r.map(x => x.id===id?{...x,[f]:v}:x));
    await db.patch("schedule", id, { [f]: v });
  };

  if (loading) return <Loader />;
  return (
    <div style={S.page}>
      <PH title={t("Cronograma","Schedule")} sub="17 · IX · 2026" canEdit={canEdit} onAdd={add} addL={t("+ EVENTO","+ EVENT")} />
      <div style={S.schedList}>
        {rows.map((row,i) => (
          <div key={row.id} style={S.schedRow}>
            <span style={S.schedIdx}>{String(i+1).padStart(2,"00")}</span>
            <input value={row.time||""} onChange={e=>upd(row.id,"time",e.target.value)} disabled={!canEdit} placeholder="00:00" style={{...S.schedTime,...(canEdit?{}:S.ro)}}/>
            <div style={S.schedBody}>
              <input value={row.event||""} onChange={e=>upd(row.id,"event",e.target.value)} disabled={!canEdit} placeholder={t("Evento...","Event...")} style={{...S.schedEvt,...(canEdit?{}:S.ro)}}/>
              <input value={row.note||""}  onChange={e=>upd(row.id,"note",e.target.value)}  disabled={!canEdit} placeholder={t("Nota...","Note...")}     style={{...S.schedNote,...(canEdit?{}:S.ro)}}/>
            </div>
            {canEdit && <button onClick={()=>remove(row.id)} style={S.xBtn}>✕</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── LOCATION ─── */
function Location({ canEdit, t }) {
  const [data, setData] = useState(null);

  useEffect(() => { db.getOne("location").then(setData); }, []);

  const upd = async (f, v) => {
    setData(d => ({ ...d, [f]: v }));
    await db.patch("location", 1, { [f]: v });
  };

  if (!data) return <Loader />;
  return (
    <div style={S.page}>
      <PH title={t("Local","Location")} sub="Luanda, Angola" />
      <div style={S.twoCol}>
        <F label={t("ENDEREÇO","ADDRESS")}       value={data.address||""}        onChange={v=>upd("address",v)}        canEdit={canEdit} multi />
        <F label={t("NOTA DO MAPA","MAP NOTE")}  value={data.map_note||""}       onChange={v=>upd("map_note",v)}       canEdit={canEdit} multi />
        <F label={t("ESTACIONAMENTO","PARKING")} value={data.parking_note||""}   onChange={v=>upd("parking_note",v)}   canEdit={canEdit} multi />
        <F label={t("TRANSPORTE","TRANSPORT")}   value={data.transport_note||""} onChange={v=>upd("transport_note",v)} canEdit={canEdit} multi />
      </div>
    </div>
  );
}

/* ─── DECOR ─── */
function Decor({ canEdit, t }) {
  const [settings, setSettings] = useState(null);
  const [items, setItems]       = useState([]);

  useEffect(() => {
    Promise.all([db.getOne("decor_settings"), db.get("decor_items")]).then(([s, i]) => { setSettings(s); setItems(i); });
  }, []);

  const updSettings = async (f, v) => {
    setSettings(d => ({ ...d, [f]: v }));
    await db.patch("decor_settings", 1, { [f]: v });
  };

  const addItem = async () => {
    const item = { id: Date.now(), name: "", status: "pending", note: "" };
    await db.upsert("decor_items", item);
    setItems(i => [...i, item]);
  };

  const removeItem = async (id) => {
    await db.delete("decor_items", id);
    setItems(i => i.filter(x => x.id !== id));
  };

  const updItem = async (id, f, v) => {
    setItems(i => i.map(x => x.id===id?{...x,[f]:v}:x));
    await db.patch("decor_items", id, { [f]: v });
  };

  if (!settings) return <Loader />;
  return (
    <div style={S.page}>
      <PH title={t("Decoração","Decor")} sub={t("Paleta & Itens","Palette & Items")} canEdit={canEdit} onAdd={addItem} addL={t("+ ITEM","+ ITEM")} />
      <div style={S.palette}>
        {(settings.palette||[]).map((c,i) => (
          <div key={i} style={{...S.palChip, background:c}}>
            <span style={S.palHex}>{c}</span>
            {canEdit && <input type="color" value={c} onChange={e=>{ const p=[...settings.palette]; p[i]=e.target.value; updSettings("palette",p); }} style={S.colorIn}/>}
          </div>
        ))}
      </div>
      <F label={t("NOTAS DE DECORAÇÃO","DECOR NOTES")} value={settings.notes||""} onChange={v=>updSettings("notes",v)} canEdit={canEdit} multi />
      <div style={S.iList}>
        {items.map(item => (
          <div key={item.id} style={S.iRow}>
            <input value={item.name||""} onChange={e=>updItem(item.id,"name",e.target.value)} disabled={!canEdit} placeholder={t("Item...","Item...")} style={{...S.iIn,...(canEdit?{}:S.ro)}}/>
            <select value={item.status} onChange={e=>updItem(item.id,"status",e.target.value)} disabled={!canEdit}
              style={{...S.sel, color:item.status==="confirmed"?"#9effa4":item.status==="pending"?"#ffe99e":"#ff9e9e"}}>
              <option value="pending">{t("Pendente","Pending")}</option>
              <option value="confirmed">{t("Confirmado","Confirmed")}</option>
              <option value="cancelled">{t("Cancelado","Cancelled")}</option>
            </select>
            {canEdit && <button onClick={()=>removeItem(item.id)} style={S.xBtn}>✕</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── BUFFET ─── */
function Buffet({ canEdit, t }) {
  const [settings, setSettings] = useState(null);
  const [items, setItems]       = useState([]);

  useEffect(() => {
    Promise.all([db.getOne("buffet_settings"), db.get("buffet_items")]).then(([s,i]) => { setSettings(s); setItems(i); });
  }, []);

  const updS = async (f, v) => { setSettings(d=>({...d,[f]:v})); await db.patch("buffet_settings",1,{[f]:v}); };

  const add = async () => {
    const item = { id: Date.now(), name: "", type: "principal", dietary: "" };
    await db.upsert("buffet_items", item);
    setItems(i => [...i, item]);
  };

  const remove = async (id) => { await db.delete("buffet_items", id); setItems(i=>i.filter(x=>x.id!==id)); };
  const upd    = async (id,f,v) => { setItems(i=>i.map(x=>x.id===id?{...x,[f]:v}:x)); await db.patch("buffet_items",id,{[f]:v}); };

  if (!settings) return <Loader />;
  return (
    <div style={S.page}>
      <PH title="Buffet" sub={t("Menu & Catering","Menu & Catering")} canEdit={canEdit} onAdd={add} addL={t("+ PRATO","+ DISH")} />
      <F label={t("EMPRESA DE CATERING","CATERING COMPANY")} value={settings.caterer||""}    onChange={v=>updS("caterer",v)}     canEdit={canEdit} />
      <F label={t("NOTAS DO MENU","MENU NOTES")}             value={settings.menu_notes||""} onChange={v=>updS("menu_notes",v)}  canEdit={canEdit} multi />
      <div style={S.iList}>
        {items.map(item => (
          <div key={item.id} style={S.iRow}>
            <input value={item.name||""} onChange={e=>upd(item.id,"name",e.target.value)} disabled={!canEdit} placeholder={t("Nome do prato...","Dish name...")} style={{...S.iIn,...(canEdit?{}:S.ro)}}/>
            <select value={item.type} onChange={e=>upd(item.id,"type",e.target.value)} disabled={!canEdit} style={S.sel}>
              <option value="entrada">{t("Entrada","Starter")}</option>
              <option value="principal">{t("Principal","Main")}</option>
              <option value="sobremesa">{t("Sobremesa","Dessert")}</option>
              <option value="bebida">{t("Bebida","Drink")}</option>
            </select>
            <input value={item.dietary||""} onChange={e=>upd(item.id,"dietary",e.target.value)} disabled={!canEdit} placeholder={t("Dietético...","Dietary...")} style={{...S.iNote,...(canEdit?{}:S.ro)}}/>
            {canEdit && <button onClick={()=>remove(item.id)} style={S.xBtn}>✕</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SUPPLIERS ─── */
function Suppliers({ canEdit, t }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { db.get("suppliers").then(d => { setRows(d); setLoading(false); }); }, []);

  const add    = async () => { const r={id:Date.now(),category:"",name:"",contact:"",status:"pending",paid:false,notes:""}; await db.upsert("suppliers",r); setRows(x=>[...x,r]); };
  const remove = async (id) => { await db.delete("suppliers",id); setRows(x=>x.filter(r=>r.id!==id)); };
  const upd    = async (id,f,v) => { setRows(x=>x.map(r=>r.id===id?{...r,[f]:v}:r)); await db.patch("suppliers",id,{[f]:v}); };

  if (loading) return <Loader />;
  return (
    <div style={S.page}>
      <PH title={t("Fornecedores","Suppliers")} sub={t("Contactos & Status","Contacts & Status")} canEdit={canEdit} onAdd={add} addL={t("+ FORNECEDOR","+ SUPPLIER")} />
      <div style={S.tWrap}>
        <table style={S.tbl}>
          <thead><tr>{[t("CATEGORIA","CATEGORY"),t("NOME","NAME"),t("CONTACTO","CONTACT"),"STATUS",t("PAGO","PAID"),t("NOTAS","NOTES"),""].map((h,i)=><th key={i} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(s=>(
              <tr key={s.id}>
                <td style={S.td}><input value={s.category||""} onChange={e=>upd(s.id,"category",e.target.value)} disabled={!canEdit} style={{...S.cIn,...(canEdit?{}:S.ro)}}/></td>
                <td style={S.td}><input value={s.name||""}     onChange={e=>upd(s.id,"name",e.target.value)}     disabled={!canEdit} style={{...S.cIn,...(canEdit?{}:S.ro)}}/></td>
                <td style={S.td}><input value={s.contact||""}  onChange={e=>upd(s.id,"contact",e.target.value)}  disabled={!canEdit} style={{...S.cIn,...(canEdit?{}:S.ro)}}/></td>
                <td style={S.td}>
                  <select value={s.status} onChange={e=>upd(s.id,"status",e.target.value)} disabled={!canEdit}
                    style={{...S.sel, color:s.status==="confirmed"?"#9effa4":s.status==="pending"?"#ffe99e":"#ff9e9e"}}>
                    <option value="pending">{t("Pendente","Pending")}</option>
                    <option value="confirmed">{t("Confirmado","Confirmed")}</option>
                    <option value="cancelled">{t("Cancelado","Cancelled")}</option>
                  </select>
                </td>
                <td style={{...S.td,textAlign:"center"}}><input type="checkbox" checked={!!s.paid} onChange={e=>upd(s.id,"paid",e.target.checked)} disabled={!canEdit}/></td>
                <td style={S.td}><input value={s.notes||""} onChange={e=>upd(s.id,"notes",e.target.value)} disabled={!canEdit} style={{...S.cIn,...(canEdit?{}:S.ro)}}/></td>
                <td style={S.td}>{canEdit&&<button onClick={()=>remove(s.id)} style={S.xBtn}>✕</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── BUDGET ─── */
function Budget({ canEdit, t }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { db.get("budget").then(d => { setRows(d); setLoading(false); }); }, []);

  const add    = async () => { const r={id:Date.now(),category:"",estimated:0,actual:0,paid:false}; await db.upsert("budget",r); setRows(x=>[...x,r]); };
  const remove = async (id) => { await db.delete("budget",id); setRows(x=>x.filter(r=>r.id!==id)); };
  const upd    = async (id,f,v) => { setRows(x=>x.map(r=>r.id===id?{...r,[f]:v}:r)); await db.patch("budget",id,{[f]:v}); };

  const totEst  = rows.reduce((s,b)=>s+Number(b.estimated),0);
  const totAct  = rows.reduce((s,b)=>s+Number(b.actual),0);
  const totPaid = rows.reduce((s,b)=>s+(b.paid?Number(b.actual||b.estimated):0),0);

  if (loading) return <Loader />;
  return (
    <div style={S.page}>
      <PH title={t("Orçamento","Budget")} sub={t("Estimado vs Real","Estimated vs Actual")} canEdit={canEdit} onAdd={add} addL={t("+ CATEGORIA","+ CATEGORY")} />
      <div style={S.budCards}>
        {[{l:t("ESTIMADO","ESTIMATED"),v:totEst},{l:t("REAL","ACTUAL"),v:totAct},{l:t("PAGO","PAID"),v:totPaid}].map((c,i)=>(
          <div key={i} style={S.budCard}>
            <div style={S.budL}>{c.l}</div>
            <div style={S.budV}>{c.v.toLocaleString()}<span style={S.budKz}> Kz</span></div>
          </div>
        ))}
      </div>
      <div style={S.tWrap}>
        <table style={S.tbl}>
          <thead><tr>{[t("CATEGORIA","CATEGORY"),t("ESTIMADO (Kz)","ESTIMATED (Kz)"),t("REAL (Kz)","ACTUAL (Kz)"),t("PAGO","PAID"),""].map((h,i)=><th key={i} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(b=>(
              <tr key={b.id}>
                <td style={S.td}><input value={b.category||""} onChange={e=>upd(b.id,"category",e.target.value)} disabled={!canEdit} style={{...S.cIn,...(canEdit?{}:S.ro)}}/></td>
                <td style={S.td}><input type="number" value={b.estimated} onChange={e=>upd(b.id,"estimated",e.target.value)} disabled={!canEdit} style={{...S.cIn,textAlign:"right",...(canEdit?{}:S.ro)}}/></td>
                <td style={S.td}><input type="number" value={b.actual}    onChange={e=>upd(b.id,"actual",e.target.value)}    disabled={!canEdit} style={{...S.cIn,textAlign:"right",...(canEdit?{}:S.ro)}}/></td>
                <td style={{...S.td,textAlign:"center"}}><input type="checkbox" checked={!!b.paid} onChange={e=>upd(b.id,"paid",e.target.checked)} disabled={!canEdit}/></td>
                <td style={S.td}>{canEdit&&<button onClick={()=>remove(b.id)} style={S.xBtn}>✕</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── GUESTS ─── */
function Guests({ canEdit, t }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { db.get("guests").then(d => { setRows(d); setLoading(false); }); }, []);

  const add    = async () => { const r={id:Date.now(),name:"",role:"guest",confirmed:false,dietary:""}; await db.upsert("guests",r); setRows(x=>[...x,r]); };
  const remove = async (id) => { await db.delete("guests",id); setRows(x=>x.filter(r=>r.id!==id)); };
  const upd    = async (id,f,v) => { setRows(x=>x.map(r=>r.id===id?{...r,[f]:v}:r)); await db.patch("guests",id,{[f]:v}); };

  if (loading) return <Loader />;
  return (
    <div style={S.page}>
      <PH title={t("Convidados","Guests")} sub={`${rows.filter(g=>g.confirmed).length} / ${rows.length} ${t("confirmados","confirmed")}`} canEdit={canEdit} onAdd={add} addL={t("+ CONVIDADO","+ GUEST")} />
      <div style={S.tWrap}>
        <table style={S.tbl}>
          <thead><tr>{[t("NOME","NAME"),t("PAPEL","ROLE"),t("CONFIRMADO","CONFIRMED"),t("DIETÉTICO","DIETARY"),""].map((h,i)=><th key={i} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(g=>(
              <tr key={g.id}>
                <td style={S.td}><input value={g.name||""} onChange={e=>upd(g.id,"name",e.target.value)} disabled={!canEdit} placeholder={t("Nome...","Name...")} style={{...S.cIn,...(canEdit?{}:S.ro)}}/></td>
                <td style={S.td}>
                  <select value={g.role} onChange={e=>upd(g.id,"role",e.target.value)} disabled={!canEdit} style={S.sel}>
                    <option value="bridesmaid">{t("Madrinha","Bridesmaid")}</option>
                    <option value="groomsman">{t("Padrinho","Groomsman")}</option>
                    <option value="godparent">{t("Padrinho/Madrinha","Godparent")}</option>
                    <option value="family">{t("Família","Family")}</option>
                    <option value="friend">{t("Amigo/a","Friend")}</option>
                    <option value="guest">{t("Convidado","Guest")}</option>
                  </select>
                </td>
                <td style={{...S.td,textAlign:"center"}}><input type="checkbox" checked={!!g.confirmed} onChange={e=>upd(g.id,"confirmed",e.target.checked)} disabled={!canEdit}/></td>
                <td style={S.td}><input value={g.dietary||""} onChange={e=>upd(g.id,"dietary",e.target.value)} disabled={!canEdit} placeholder={t("Restrições...","Restrictions...")} style={{...S.cIn,...(canEdit?{}:S.ro)}}/></td>
                <td style={S.td}>{canEdit&&<button onClick={()=>remove(g.id)} style={S.xBtn}>✕</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── DOCUMENTS ─── */
function Documents({ canEdit, t }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { db.get("documents").then(d => { setRows(d); setLoading(false); }); }, []);

  const add    = async () => { const r={id:Date.now(),name:"",type:"contract",link:""}; await db.upsert("documents",r); setRows(x=>[...x,r]); };
  const remove = async (id) => { await db.delete("documents",id); setRows(x=>x.filter(r=>r.id!==id)); };
  const upd    = async (id,f,v) => { setRows(x=>x.map(r=>r.id===id?{...r,[f]:v}:r)); await db.patch("documents",id,{[f]:v}); };

  if (loading) return <Loader />;
  return (
    <div style={S.page}>
      <PH title={t("Documentos","Documents")} sub={t("Contratos & Referências","Contracts & References")} canEdit={canEdit} onAdd={add} addL={t("+ DOCUMENTO","+ DOCUMENT")} />
      <div style={S.iList}>
        {rows.map(doc=>(
          <div key={doc.id} style={S.iRow}>
            <select value={doc.type} onChange={e=>upd(doc.id,"type",e.target.value)} disabled={!canEdit} style={{...S.sel,width:"130px"}}>
              <option value="contract">{t("Contrato","Contract")}</option>
              <option value="invoice">{t("Fatura","Invoice")}</option>
              <option value="reference">{t("Referência","Reference")}</option>
              <option value="other">{t("Outro","Other")}</option>
            </select>
            <input value={doc.name||""} onChange={e=>upd(doc.id,"name",e.target.value)} disabled={!canEdit} placeholder={t("Nome...","Name...")} style={{...S.iIn,...(canEdit?{}:S.ro)}}/>
            <input value={doc.link||""} onChange={e=>upd(doc.id,"link",e.target.value)} disabled={!canEdit} placeholder="Link / URL" style={{...S.iNote,...(canEdit?{}:S.ro)}}/>
            {canEdit&&<button onClick={()=>remove(doc.id)} style={S.xBtn}>✕</button>}
          </div>
        ))}
        {rows.length===0&&<div style={S.empty}>{t("Nenhum documento ainda.","No documents yet.")}</div>}
      </div>
    </div>
  );
}

/* ─── SHARED ─── */
function Loader() {
  return <div style={S.loader}>
    <GStyles/>
    <div style={S.loaderDot}/>
  </div>;
}

function PH({ title, sub, canEdit, onAdd, addL }) {
  return (
    <div style={S.ph}>
      <div><h2 style={S.phTitle}>{title}</h2>{sub&&<div style={S.phSub}>{sub}</div>}</div>
      {canEdit&&onAdd&&<button onClick={onAdd} style={S.addBtn}>{addL}</button>}
    </div>
  );
}

function F({ label, value, onChange, canEdit, multi }) {
  return (
    <div style={S.fWrap}>
      <div style={S.fLabel}>{label}</div>
      {multi
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} disabled={!canEdit} rows={3} style={{...S.fTA,...(canEdit?{}:S.ro)}}/>
        : <input    value={value} onChange={e=>onChange(e.target.value)} disabled={!canEdit}           style={{...S.fIn,...(canEdit?{}:S.ro)}}/>
      }
    </div>
  );
}

function GStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Barlow:wght@300;400;500&display=swap');
      *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
      body { background:#0a0a0a; }
      @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
      input:focus, select:focus, textarea:focus { outline:none; border-color:#555 !important; }
      input[type=number]::-webkit-inner-spin-button { opacity:0.3; }
      input::placeholder, textarea::placeholder { color:#444; }
      input[type=checkbox] { accent-color:#fff; width:14px; height:14px; cursor:pointer; }
      ::-webkit-scrollbar { width:3px; height:3px; }
      ::-webkit-scrollbar-track { background:#0a0a0a; }
      ::-webkit-scrollbar-thumb { background:#333; border-radius:2px; }
      button { transition:opacity .15s; }
      button:hover { opacity:0.7; }
      tr:hover td { background:rgba(255,255,255,0.015) !important; }
      select option { background:#1a1a1a; color:#ccc; }
    `}</style>
  );
}

const S = {
  loginBg:    { minHeight:"100vh", background:"#0a0a0a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow',sans-serif" },
  loginCard:  { background:"#111", border:"1px solid #1e1e1e", padding:"64px 52px", width:"400px", textAlign:"center", animation:"fadeUp .6s ease both" },
  loginEye:   { fontSize:"9px", letterSpacing:"0.35em", color:"#444", marginBottom:"36px" },
  loginNames: { fontSize:"56px", lineHeight:1.05, color:"#fff", fontFamily:"'Cormorant Garamond',serif", fontWeight:300, marginBottom:"14px" },
  loginAmp:   { color:"#555", fontStyle:"italic" },
  loginWhen:  { fontSize:"10px", letterSpacing:"0.2em", color:"#444", marginBottom:"44px" },
  loginRule:  { height:"1px", background:"#1e1e1e", margin:"0 0 36px" },
  loginFL:    { fontSize:"9px", letterSpacing:"0.25em", color:"#555", textAlign:"left", marginBottom:"8px" },
  loginSel:   { width:"100%", padding:"12px 14px", background:"#1a1a1a", border:"1px solid #2a2a2a", color:"#aaa", fontSize:"13px", fontFamily:"'Barlow',sans-serif", marginBottom:"12px" },
  loginPin:   { width:"100%", padding:"12px 14px", background:"#1a1a1a", border:"1px solid #2a2a2a", color:"#fff", fontSize:"20px", textAlign:"center", letterSpacing:"0.5em", fontFamily:"monospace", marginBottom:"20px", transition:"border .2s", boxSizing:"border-box" },
  loginPinErr:{ border:"1px solid #c0392b", background:"#1a0800" },
  loginBtn:   { width:"100%", padding:"14px", background:"#fff", color:"#0a0a0a", border:"none", fontSize:"10px", letterSpacing:"0.3em", cursor:"pointer", fontFamily:"'Barlow',sans-serif", fontWeight:600, marginBottom:"18px" },
  loginHint:  { fontSize:"10px", color:"#333", letterSpacing:"0.1em" },
  app:    { display:"flex", minHeight:"100vh", background:"#0a0a0a", color:"#bbb", fontFamily:"'Barlow',sans-serif" },
  sidebar:{ background:"#0e0e0e", borderRight:"1px solid #1a1a1a", display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", flexShrink:0, transition:"width .25s ease", overflow:"hidden" },
  sbTop:  { padding:"24px 16px 20px", borderBottom:"1px solid #1a1a1a", display:"flex", alignItems:"center", justifyContent:"space-between", minHeight:"74px" },
  sbBrand:{ overflow:"hidden" },
  sbNames:{ fontSize:"18px", letterSpacing:"0.2em", color:"#fff", fontFamily:"'Cormorant Garamond',serif", fontWeight:300, whiteSpace:"nowrap" },
  sbDate: { fontSize:"9px", color:"#333", letterSpacing:"0.15em", marginTop:"4px", whiteSpace:"nowrap" },
  slimBtn:{ background:"none", border:"1px solid #222", color:"#444", padding:"5px 9px", cursor:"pointer", fontSize:"11px", flexShrink:0 },
  nav:    { flex:1, padding:"10px 0", overflowY:"auto" },
  navItem:{ display:"flex", alignItems:"center", gap:"12px", width:"100%", padding:"11px 16px", background:"none", border:"none", borderLeft:"2px solid transparent", color:"#444", cursor:"pointer", textAlign:"left", animation:"fadeUp .4s ease both", whiteSpace:"nowrap", transition:"all .15s" },
  navOn:  { color:"#fff", background:"#161616", borderLeft:"2px solid #fff" },
  navIdx: { fontSize:"9px", letterSpacing:"0.15em", color:"#333", width:"18px", flexShrink:0, fontFamily:"monospace" },
  navTxt: { fontSize:"11px", letterSpacing:"0.1em" },
  sbFoot: { padding:"14px 16px", borderTop:"1px solid #1a1a1a", display:"flex", gap:"8px" },
  footBtn:{ flex:1, padding:"8px", background:"none", border:"1px solid #222", color:"#444", fontSize:"9px", letterSpacing:"0.15em", cursor:"pointer" },
  main:   { flex:1, overflowY:"auto" },
  page:   { padding:"56px 52px 80px", maxWidth:"980px", animation:"fadeUp .4s ease both" },
  loader: { display:"flex", alignItems:"center", justifyContent:"center", height:"60vh" },
  loaderDot:{ width:"8px", height:"8px", background:"#333", borderRadius:"50%", animation:"pulse 1.2s ease infinite" },
  hero:   { marginBottom:"52px" },
  heroEye:{ fontSize:"9px", letterSpacing:"0.35em", color:"#333", marginBottom:"20px" },
  heroH1: { fontSize:"76px", lineHeight:1, color:"#fff", fontFamily:"'Cormorant Garamond',serif", fontWeight:300, marginBottom:"18px" },
  heroAmp:{ color:"#444", fontStyle:"italic" },
  heroSub:{ fontSize:"12px", letterSpacing:"0.2em", color:"#444" },
  cdRow:  { display:"flex", gap:"2px", marginBottom:"52px" },
  cdBox:  { flex:1, background:"#111", border:"1px solid #1a1a1a", padding:"28px 12px", textAlign:"center" },
  cdNum:  { fontSize:"48px", fontWeight:300, color:"#fff", fontFamily:"'Cormorant Garamond',serif", lineHeight:1 },
  cdLbl:  { fontSize:"8px", letterSpacing:"0.3em", color:"#333", marginTop:"10px" },
  statsGrid:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"2px", marginBottom:"36px" },
  statBox:  { background:"#111", border:"1px solid #1a1a1a", padding:"26px 22px" },
  statL:    { fontSize:"8px", letterSpacing:"0.25em", color:"#333", marginBottom:"14px" },
  statV:    { fontSize:"30px", color:"#fff", fontFamily:"'Cormorant Garamond',serif", fontWeight:300, marginBottom:"6px" },
  statS:    { fontSize:"10px", color:"#444" },
  locBanner: { background:"#111", border:"1px solid #1a1a1a", padding:"28px 30px" },
  locBannerL:{ fontSize:"8px", letterSpacing:"0.3em", color:"#333", marginBottom:"10px" },
  locBannerA:{ fontSize:"15px", color:"#bbb", lineHeight:1.7, fontFamily:"'Cormorant Garamond',serif" },
  ph:     { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"40px", paddingBottom:"22px", borderBottom:"1px solid #1a1a1a" },
  phTitle:{ fontSize:"38px", color:"#fff", fontFamily:"'Cormorant Garamond',serif", fontWeight:300, letterSpacing:"0.04em" },
  phSub:  { fontSize:"10px", color:"#333", marginTop:"6px", letterSpacing:"0.1em" },
  addBtn: { padding:"10px 22px", background:"#fff", color:"#0a0a0a", border:"none", fontSize:"9px", letterSpacing:"0.25em", cursor:"pointer", fontWeight:600, flexShrink:0 },
  schedList:{ display:"flex", flexDirection:"column", gap:"2px" },
  schedRow: { display:"flex", gap:"14px", alignItems:"flex-start", background:"#111", border:"1px solid #1a1a1a", padding:"14px 18px" },
  schedIdx: { fontSize:"9px", color:"#2a2a2a", fontFamily:"monospace", width:"18px", paddingTop:"10px", flexShrink:0 },
  schedTime:{ width:"64px", padding:"8px", background:"#161616", border:"1px solid #252525", color:"#fff", fontSize:"13px", fontFamily:"monospace", textAlign:"center", flexShrink:0 },
  schedBody:{ flex:1, display:"flex", flexDirection:"column", gap:"6px" },
  schedEvt: { width:"100%", padding:"8px 12px", background:"#161616", border:"1px solid #252525", color:"#ddd", fontSize:"13px", fontFamily:"'Barlow',sans-serif" },
  schedNote:{ width:"100%", padding:"7px 12px", background:"#161616", border:"1px solid #1e1e1e", color:"#555", fontSize:"11px", fontFamily:"'Barlow',sans-serif" },
  twoCol: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"22px" },
  fWrap:  { marginBottom:0 },
  fLabel: { fontSize:"8px", letterSpacing:"0.25em", color:"#333", marginBottom:"8px" },
  fIn:    { width:"100%", padding:"10px 14px", background:"#161616", border:"1px solid #252525", color:"#ccc", fontSize:"13px", fontFamily:"'Barlow',sans-serif", boxSizing:"border-box" },
  fTA:    { width:"100%", padding:"10px 14px", background:"#161616", border:"1px solid #252525", color:"#ccc", fontSize:"13px", fontFamily:"'Barlow',sans-serif", resize:"vertical", boxSizing:"border-box" },
  palette:{ display:"flex", gap:"6px", marginBottom:"28px" },
  palChip:{ width:"52px", height:"52px", border:"1px solid #2a2a2a", position:"relative", overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom:"4px" },
  palHex: { fontSize:"7px", color:"rgba(255,255,255,0.45)", position:"relative", zIndex:1 },
  colorIn:{ position:"absolute", opacity:0, width:"100%", height:"100%", cursor:"pointer", top:0, left:0 },
  iList:  { display:"flex", flexDirection:"column", gap:"5px", marginTop:"20px" },
  iRow:   { display:"flex", gap:"8px", alignItems:"center" },
  iIn:    { flex:1, padding:"9px 12px", background:"#161616", border:"1px solid #252525", color:"#ccc", fontSize:"13px", fontFamily:"'Barlow',sans-serif" },
  iNote:  { flex:1, padding:"9px 12px", background:"#161616", border:"1px solid #1e1e1e", color:"#666", fontSize:"12px", fontFamily:"'Barlow',sans-serif" },
  sel:    { padding:"9px 10px", background:"#161616", border:"1px solid #252525", color:"#aaa", fontSize:"11px", fontFamily:"'Barlow',sans-serif" },
  xBtn:   { padding:"6px 12px", background:"none", border:"1px solid #222", color:"#333", fontSize:"10px", cursor:"pointer", flexShrink:0 },
  tWrap:  { overflowX:"auto" },
  tbl:    { width:"100%", borderCollapse:"collapse" },
  th:     { padding:"10px 12px", background:"#0e0e0e", fontSize:"8px", color:"#333", letterSpacing:"0.2em", textAlign:"left", borderBottom:"1px solid #222" },
  td:     { padding:"7px 10px", borderBottom:"1px solid #141414", verticalAlign:"middle" },
  cIn:    { width:"100%", padding:"5px 8px", background:"transparent", border:"1px solid transparent", color:"#ccc", fontSize:"12px", fontFamily:"'Barlow',sans-serif" },
  budCards:{ display:"flex", gap:"2px", marginBottom:"30px" },
  budCard: { flex:1, background:"#111", border:"1px solid #1a1a1a", padding:"24px 20px" },
  budL:    { fontSize:"8px", letterSpacing:"0.25em", color:"#333", marginBottom:"10px" },
  budV:    { fontSize:"30px", color:"#fff", fontFamily:"'Cormorant Garamond',serif", fontWeight:300 },
  budKz:   { fontSize:"13px", color:"#444" },
  empty:   { padding:"40px", textAlign:"center", color:"#2a2a2a", fontSize:"12px", border:"1px dashed #1a1a1a" },
  ro:      { background:"transparent", border:"1px solid transparent", cursor:"default" },
};
