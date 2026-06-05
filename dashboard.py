import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import os
import glob

st.set_page_config(
    page_title="Dashboard Siswa Berprestasi",
    page_icon="🏆",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── CSS ───────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
.metric-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 20px;
    color: white;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.metric-card h2 { font-size: 2.2rem; margin: 0; font-weight: 700; }
.metric-card p  { font-size: 0.85rem; margin: 4px 0 0; opacity: 0.85; }

.metric-green  { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.metric-orange { background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%); color: #333; }
.metric-red    { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); }
.metric-blue   { background: linear-gradient(135deg, #2980B9 0%, #6DD5FA 100%); }
.metric-teal   { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }

.section-header {
    font-size: 1.3rem;
    font-weight: 700;
    color: #2d3748;
    border-left: 4px solid #667eea;
    padding-left: 12px;
    margin: 24px 0 12px;
}
</style>
""", unsafe_allow_html=True)


# ─── Load data ─────────────────────────────────────────────────────────────────
@st.cache_data
def load_data():
    base = os.path.dirname(__file__)
    # cari file CSV terbaru
    pattern = os.path.join(base, "data_siswa_berprestasi_*.csv")
    files = sorted(glob.glob(pattern))
    if not files:
        st.error("File CSV tidak ditemukan.")
        st.stop()
    path = files[-1]

    df = pd.read_csv(path, encoding="utf-8-sig")
    df["tanggal_post"] = pd.to_datetime(df["tanggal_post"], errors="coerce", utc=True)
    df["bulan"] = df["tanggal_post"].dt.to_period("M").astype(str)
    df["is_kelas_xi"] = df["is_kelas_xi"].astype(bool)

    # file semua data
    pattern_all = os.path.join(base, "data_instagram_all_*.csv")
    files_all = sorted(glob.glob(pattern_all))
    df_all = pd.read_csv(files_all[-1], encoding="utf-8-sig") if files_all else pd.DataFrame()
    return df, df_all, os.path.basename(path)


df, df_all, filename = load_data()


# ─── Sidebar filters ───────────────────────────────────────────────────────────
st.sidebar.image(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Instagram_logo_2016.svg/240px-Instagram_logo_2016.svg.png",
    width=60,
)
st.sidebar.title("Filter Data")
st.sidebar.caption(f"Sumber: {filename}")

bidang_opts = ["Semua"] + sorted(df["bidang_prestasi"].dropna().unique().tolist())
tingkat_opts = ["Semua"] + sorted(df["tingkat_kompetisi"].dropna().unique().tolist())
provinsi_opts = ["Semua"] + sorted(df["provinsi"].dropna().unique().tolist())

sel_bidang   = st.sidebar.selectbox("Bidang Prestasi", bidang_opts)
sel_tingkat  = st.sidebar.selectbox("Tingkat Kompetisi", tingkat_opts)
sel_provinsi = st.sidebar.selectbox("Provinsi", provinsi_opts)
kelas_xi     = st.sidebar.checkbox("Hanya Kelas XI", value=False)

dff = df.copy()
if sel_bidang   != "Semua": dff = dff[dff["bidang_prestasi"]    == sel_bidang]
if sel_tingkat  != "Semua": dff = dff[dff["tingkat_kompetisi"]  == sel_tingkat]
if sel_provinsi != "Semua": dff = dff[dff["provinsi"]           == sel_provinsi]
if kelas_xi:                dff = dff[dff["is_kelas_xi"]        == True]

st.sidebar.markdown("---")
st.sidebar.metric("Data setelah filter", f"{len(dff):,}")


# ─── Header ────────────────────────────────────────────────────────────────────
st.title("🏆 Dashboard Siswa Berprestasi SMA/SMP Indonesia 2026")
st.markdown(
    "Data dikumpulkan dari **Instagram** menggunakan Apify Hashtag Scraper. "
    "Sumber: postingan dengan hashtag terkait siswa berprestasi (kelas XI tahun 2026)."
)
st.divider()


# ─── KPI cards ─────────────────────────────────────────────────────────────────
total_scrape   = len(df_all) if not df_all.empty else len(df)
total_relevan  = len(df)
kelas_xi_n     = int(df["is_kelas_xi"].sum())
nama_n         = int(df["nama_siswa"].notna().sum())
sekolah_n      = int(df["sekolah"].notna().sum())
provinsi_n     = int(df["provinsi"].notna().sum())

c1, c2, c3, c4, c5, c6 = st.columns(6)
cards = [
    (c1, total_scrape,  "Total Di-scrape",         "metric-card"),
    (c2, total_relevan, "Postingan Relevan",        "metric-card metric-green"),
    (c3, kelas_xi_n,    "Terdeteksi Kelas XI",      "metric-card metric-blue"),
    (c4, nama_n,        "Nama Siswa Terdeteksi",    "metric-card metric-orange"),
    (c5, sekolah_n,     "Sekolah Terdeteksi",       "metric-card metric-red"),
    (c6, provinsi_n,    "Provinsi Terdeteksi",      "metric-card metric-teal"),
]
for col, val, label, cls in cards:
    with col:
        st.markdown(
            f'<div class="{cls}"><h2>{val:,}</h2><p>{label}</p></div>',
            unsafe_allow_html=True,
        )

st.markdown("")


# ─── Row 1: Bidang & Tingkat ───────────────────────────────────────────────────
st.markdown('<p class="section-header">Distribusi Bidang & Tingkat Kompetisi</p>', unsafe_allow_html=True)
col1, col2 = st.columns([3, 2])

with col1:
    bidang_counts = (
        dff["bidang_prestasi"]
        .fillna("Tidak Diketahui")
        .value_counts()
        .reset_index()
    )
    bidang_counts.columns = ["Bidang", "Jumlah"]
    fig_bidang = px.bar(
        bidang_counts.sort_values("Jumlah"),
        x="Jumlah", y="Bidang", orientation="h",
        title="Bidang Prestasi",
        color="Jumlah",
        color_continuous_scale="Viridis",
        text="Jumlah",
    )
    fig_bidang.update_traces(textposition="outside")
    fig_bidang.update_layout(
        showlegend=False, coloraxis_showscale=False,
        plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=10, r=20, t=40, b=10), height=350,
    )
    st.plotly_chart(fig_bidang, use_container_width=True)

with col2:
    tingkat_counts = (
        dff["tingkat_kompetisi"]
        .fillna("Tidak Diketahui")
        .value_counts()
        .reset_index()
    )
    tingkat_counts.columns = ["Tingkat", "Jumlah"]
    colors_tingkat = {
        "Internasional": "#FF6B6B",
        "Nasional"     : "#4ECDC4",
        "Provinsi"     : "#45B7D1",
        "Kota/Kabupaten": "#96CEB4",
        "Tidak Diketahui": "#DDD",
    }
    fig_tingkat = px.pie(
        tingkat_counts,
        names="Tingkat", values="Jumlah",
        title="Tingkat Kompetisi",
        color="Tingkat",
        color_discrete_map=colors_tingkat,
        hole=0.4,
    )
    fig_tingkat.update_traces(textposition="inside", textinfo="percent+label")
    fig_tingkat.update_layout(
        showlegend=True,
        plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=10, r=10, t=40, b=10), height=350,
    )
    st.plotly_chart(fig_tingkat, use_container_width=True)


# ─── Row 2: Provinsi & Trend ───────────────────────────────────────────────────
st.markdown('<p class="section-header">Sebaran Geografis & Tren Waktu</p>', unsafe_allow_html=True)
col3, col4 = st.columns([2, 3])

with col3:
    prov_counts = (
        dff["provinsi"]
        .fillna("Tidak Diketahui")
        .value_counts()
        .head(12)
        .reset_index()
    )
    prov_counts.columns = ["Provinsi", "Jumlah"]
    fig_prov = px.bar(
        prov_counts.sort_values("Jumlah"),
        x="Jumlah", y="Provinsi", orientation="h",
        title="Top 12 Provinsi",
        color="Jumlah",
        color_continuous_scale="Blues",
        text="Jumlah",
    )
    fig_prov.update_traces(textposition="outside")
    fig_prov.update_layout(
        showlegend=False, coloraxis_showscale=False,
        plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=10, r=20, t=40, b=10), height=380,
    )
    st.plotly_chart(fig_prov, use_container_width=True)

with col4:
    trend = (
        dff.dropna(subset=["bulan"])
        .groupby("bulan")
        .size()
        .reset_index(name="Jumlah")
        .sort_values("bulan")
    )
    if not trend.empty:
        fig_trend = px.area(
            trend, x="bulan", y="Jumlah",
            title="Tren Jumlah Postingan per Bulan",
            markers=True,
            color_discrete_sequence=["#667eea"],
        )
        fig_trend.update_layout(
            xaxis_title="Bulan", yaxis_title="Jumlah Postingan",
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            margin=dict(l=10, r=10, t=40, b=10), height=380,
        )
        st.plotly_chart(fig_trend, use_container_width=True)
    else:
        st.info("Tidak ada data tren (tanggal tidak tersedia setelah filter).")


# ─── Row 3: Heatmap & Top Sekolah ─────────────────────────────────────────────
st.markdown('<p class="section-header">Korelasi Bidang × Tingkat & Top Sekolah</p>', unsafe_allow_html=True)
col5, col6 = st.columns([3, 2])

with col5:
    ct = pd.crosstab(
        dff["bidang_prestasi"].fillna("Tidak Diketahui"),
        dff["tingkat_kompetisi"].fillna("Tidak Diketahui"),
    )
    if not ct.empty:
        fig_heat = px.imshow(
            ct,
            title="Heatmap: Bidang vs Tingkat Kompetisi",
            color_continuous_scale="YlGnBu",
            text_auto=True,
            aspect="auto",
        )
        fig_heat.update_layout(
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            margin=dict(l=10, r=10, t=40, b=60), height=360,
            xaxis_title="Tingkat", yaxis_title="Bidang",
        )
        st.plotly_chart(fig_heat, use_container_width=True)
    else:
        st.info("Tidak cukup data untuk heatmap.")

with col6:
    sekolah_counts = (
        dff["sekolah"]
        .dropna()
        .value_counts()
        .head(10)
        .reset_index()
    )
    sekolah_counts.columns = ["Sekolah", "Jumlah"]
    if not sekolah_counts.empty:
        fig_skl = px.bar(
            sekolah_counts.sort_values("Jumlah"),
            x="Jumlah", y="Sekolah", orientation="h",
            title="Top 10 Sekolah",
            color="Jumlah",
            color_continuous_scale="Oranges",
            text="Jumlah",
        )
        fig_skl.update_traces(textposition="outside")
        fig_skl.update_layout(
            showlegend=False, coloraxis_showscale=False,
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            margin=dict(l=10, r=20, t=40, b=10), height=360,
        )
        st.plotly_chart(fig_skl, use_container_width=True)
    else:
        st.info("Tidak ada data sekolah.")


# ─── Row 4: Engagement ────────────────────────────────────────────────────────
st.markdown('<p class="section-header">Analisis Engagement (Likes & Komentar)</p>', unsafe_allow_html=True)
col7, col8 = st.columns(2)

with col7:
    eng_bidang = (
        dff.groupby("bidang_prestasi")[["likes", "komentar"]]
        .mean()
        .round(1)
        .reset_index()
        .dropna(subset=["bidang_prestasi"])
    )
    if not eng_bidang.empty:
        fig_eng = px.bar(
            eng_bidang.melt(id_vars="bidang_prestasi", value_vars=["likes", "komentar"]),
            x="bidang_prestasi", y="value", color="variable", barmode="group",
            title="Rata-rata Likes & Komentar per Bidang",
            labels={"bidang_prestasi": "Bidang", "value": "Rata-rata", "variable": "Metrik"},
            color_discrete_map={"likes": "#667eea", "komentar": "#f7971e"},
        )
        fig_eng.update_layout(
            xaxis_tickangle=-30,
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            margin=dict(l=10, r=10, t=40, b=80), height=350,
        )
        st.plotly_chart(fig_eng, use_container_width=True)

with col8:
    top_hashtag = (
        dff["hashtag_sumber"]
        .value_counts()
        .head(15)
        .reset_index()
    )
    top_hashtag.columns = ["Hashtag", "Jumlah"]
    if not top_hashtag.empty:
        fig_ht = px.bar(
            top_hashtag,
            x="Hashtag", y="Jumlah",
            title="Top 15 Hashtag Sumber",
            color="Jumlah",
            color_continuous_scale="Purples",
            text="Jumlah",
        )
        fig_ht.update_traces(textposition="outside")
        fig_ht.update_layout(
            xaxis_tickangle=-45,
            showlegend=False, coloraxis_showscale=False,
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            margin=dict(l=10, r=10, t=40, b=100), height=350,
        )
        st.plotly_chart(fig_ht, use_container_width=True)


# ─── Data table ────────────────────────────────────────────────────────────────
st.markdown('<p class="section-header">Tabel Data Lengkap</p>', unsafe_allow_html=True)

search = st.text_input("🔍 Cari nama siswa / sekolah / caption...")

display_cols = [
    "tanggal_post", "nama_siswa", "sekolah", "provinsi",
    "bidang_prestasi", "tingkat_kompetisi", "info_juara",
    "is_kelas_xi", "likes", "komentar", "url",
]

tbl = dff[display_cols].copy()
tbl["tanggal_post"] = tbl["tanggal_post"].dt.strftime("%Y-%m-%d %H:%M")
tbl["is_kelas_xi"] = tbl["is_kelas_xi"].map({True: "✅ Ya", False: "❌ Tidak"})
tbl = tbl.fillna("-")

if search:
    mask = (
        tbl["nama_siswa"].str.contains(search, case=False, na=False) |
        tbl["sekolah"].str.contains(search, case=False, na=False) |
        dff["caption"].str.contains(search, case=False, na=False)
    )
    tbl = tbl[mask]

st.caption(f"Menampilkan {len(tbl):,} dari {len(dff):,} baris")
st.dataframe(
    tbl.reset_index(drop=True),
    use_container_width=True,
    height=400,
    column_config={
        "url": st.column_config.LinkColumn("Link Post", display_text="Buka ↗"),
        "tanggal_post": "Tanggal",
        "nama_siswa": "Nama Siswa",
        "sekolah": "Sekolah",
        "provinsi": "Provinsi",
        "bidang_prestasi": "Bidang",
        "tingkat_kompetisi": "Tingkat",
        "info_juara": "Info Juara",
        "is_kelas_xi": "Kelas XI",
        "likes": st.column_config.NumberColumn("👍 Likes"),
        "komentar": st.column_config.NumberColumn("💬 Komentar"),
    },
)

csv_export = tbl.to_csv(index=False).encode("utf-8-sig")
st.download_button(
    "⬇️ Download Tabel (CSV)",
    data=csv_export,
    file_name="hasil_filter_siswa_berprestasi.csv",
    mime="text/csv",
)

st.divider()
st.caption("Information Retrieval · Tugas 1 · Scraping Instagram Siswa Berprestasi SMA/SMP Indonesia 2026")
