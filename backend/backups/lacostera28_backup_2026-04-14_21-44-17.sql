--
-- PostgreSQL database dump
--

\restrict ggcTpMBF77aze7UyTrVl96MvaMBOEKKXld0v1d5E5IbwuG0LV3SD1sjd1HAmo1Y

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bitacora; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bitacora (
    id integer NOT NULL,
    vino_id integer,
    nombre_vino character varying(100),
    tipo_movimiento character varying(20),
    cantidad integer,
    usuario character varying(100),
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bitacora OWNER TO postgres;

--
-- Name: bitacora_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bitacora_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bitacora_id_seq OWNER TO postgres;

--
-- Name: bitacora_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bitacora_id_seq OWNED BY public.bitacora.id;


--
-- Name: configuracion_sistema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion_sistema (
    id integer NOT NULL,
    nombre_restaurante character varying(150) NOT NULL,
    moneda character varying(10) DEFAULT 'MXN'::character varying NOT NULL,
    stock_minimo_default integer DEFAULT 5 NOT NULL,
    dias_expiracion_recuperacion integer DEFAULT 1 NOT NULL,
    permitir_registro_publico boolean DEFAULT false NOT NULL,
    ultima_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.configuracion_sistema OWNER TO postgres;

--
-- Name: movimientos_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos_inventario (
    id integer NOT NULL,
    id_vino integer,
    id_usuario integer,
    tipo_movimiento character varying(20) NOT NULL,
    motivo character varying(50),
    cantidad integer NOT NULL,
    fecha_movimiento timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT movimientos_inventario_tipo_movimiento_check CHECK (((tipo_movimiento)::text = ANY ((ARRAY['Entrada'::character varying, 'Salida'::character varying])::text[])))
);


ALTER TABLE public.movimientos_inventario OWNER TO postgres;

--
-- Name: movimientos_inventario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimientos_inventario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimientos_inventario_id_seq OWNER TO postgres;

--
-- Name: movimientos_inventario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimientos_inventario_id_seq OWNED BY public.movimientos_inventario.id;


--
-- Name: proveedores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedores (
    id integer NOT NULL,
    empresa character varying(150) NOT NULL,
    contacto character varying(100) NOT NULL,
    telefono character varying(20),
    correo character varying(100),
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.proveedores OWNER TO postgres;

--
-- Name: proveedores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proveedores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proveedores_id_seq OWNER TO postgres;

--
-- Name: proveedores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proveedores_id_seq OWNED BY public.proveedores.id;


--
-- Name: recuperacion_password; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recuperacion_password (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expira_en timestamp without time zone NOT NULL,
    usado boolean DEFAULT false NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.recuperacion_password OWNER TO postgres;

--
-- Name: recuperacion_password_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recuperacion_password_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recuperacion_password_id_seq OWNER TO postgres;

--
-- Name: recuperacion_password_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recuperacion_password_id_seq OWNED BY public.recuperacion_password.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    rol character varying(50) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_rol_check CHECK (((rol)::text = ANY ((ARRAY['Administrador'::character varying, 'Sommelier'::character varying, 'Mesero'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: vinos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vinos (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    bodega character varying(100),
    pais character varying(50),
    region character varying(100),
    cepa character varying(100),
    anada integer,
    precio_compra numeric(10,2),
    precio_venta numeric(10,2),
    imagen_url character varying(255),
    stock_actual integer DEFAULT 0,
    stock_minimo integer DEFAULT 5,
    estado character varying(20) DEFAULT 'Activo'::character varying,
    id_proveedor integer
);


ALTER TABLE public.vinos OWNER TO postgres;

--
-- Name: vinos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vinos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vinos_id_seq OWNER TO postgres;

--
-- Name: vinos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vinos_id_seq OWNED BY public.vinos.id;


--
-- Name: bitacora id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bitacora ALTER COLUMN id SET DEFAULT nextval('public.bitacora_id_seq'::regclass);


--
-- Name: movimientos_inventario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario ALTER COLUMN id SET DEFAULT nextval('public.movimientos_inventario_id_seq'::regclass);


--
-- Name: proveedores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores ALTER COLUMN id SET DEFAULT nextval('public.proveedores_id_seq'::regclass);


--
-- Name: recuperacion_password id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recuperacion_password ALTER COLUMN id SET DEFAULT nextval('public.recuperacion_password_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: vinos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vinos ALTER COLUMN id SET DEFAULT nextval('public.vinos_id_seq'::regclass);


--
-- Data for Name: bitacora; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bitacora (id, vino_id, nombre_vino, tipo_movimiento, cantidad, usuario, fecha) FROM stdin;
1	2	Vino Tinto Mercy	Salida (-)	1	Administrador	2026-04-13 11:08:49.676034
2	1	Vino Tinto Merlot	Salida (-)	1	Administrador	2026-04-13 11:08:50.049312
3	2	Vino Tinto Mercy	Salida (-)	1	Administrador	2026-04-13 11:08:50.369109
4	1	Vino Tinto Merlot	Salida (-)	1	Administrador	2026-04-13 11:08:50.704951
5	2	Vino Tinto Mercy	Salida (-)	1	Administrador	2026-04-13 11:08:51.072822
6	1	Vino Tinto Merlot	Salida (-)	1	Administrador	2026-04-13 11:08:51.824761
7	2	Vino Tinto Mercy	Baja	0	Johanan Guerrero	2026-04-13 14:50:46.105068
\.


--
-- Data for Name: configuracion_sistema; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracion_sistema (id, nombre_restaurante, moneda, stock_minimo_default, dias_expiracion_recuperacion, permitir_registro_publico, ultima_actualizacion) FROM stdin;
\.


--
-- Data for Name: movimientos_inventario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimientos_inventario (id, id_vino, id_usuario, tipo_movimiento, motivo, cantidad, fecha_movimiento) FROM stdin;
\.


--
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proveedores (id, empresa, contacto, telefono, correo, fecha_registro) FROM stdin;
1	La Europea	Pipo	9832114161	johanansonic@gmail.com	2026-04-13 08:35:51.758338
\.


--
-- Data for Name: recuperacion_password; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recuperacion_password (id, usuario_id, token_hash, expira_en, usado, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, email, password_hash, rol, fecha_creacion) FROM stdin;
1	Johanan Guerrero	johanan@lacostera.com	$2b$10$NJGXPTJNDsjqPBF0ML5vs.0PutOoe5g7o7eyWMIlv6hd65wLurq4W	Administrador	2026-04-13 01:15:06.051441
2	Fabian	fabianhernandez@costera28.com	$2b$10$3Zbov4.Tt/3kVpvABBt3B.I8bgg3VEFTS4.n9g38vruPD9Aijb7Ka	Sommelier	2026-04-13 12:01:40.698518
\.


--
-- Data for Name: vinos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vinos (id, nombre, bodega, pais, region, cepa, anada, precio_compra, precio_venta, imagen_url, stock_actual, stock_minimo, estado, id_proveedor) FROM stdin;
1	Vino Tinto Merlot	Casa Madero	México	\N	Merlot	2024	\N	600.00	\N	11	5	Activo	\N
2	Vino Tinto Mercy	Casa del Johis	Mexico	\N	Uva	2020	\N	340.00	\N	11	5	Inactivo	\N
\.


--
-- Name: bitacora_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bitacora_id_seq', 7, true);


--
-- Name: movimientos_inventario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimientos_inventario_id_seq', 1, false);


--
-- Name: proveedores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proveedores_id_seq', 1, true);


--
-- Name: recuperacion_password_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recuperacion_password_id_seq', 1, false);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 2, true);


--
-- Name: vinos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vinos_id_seq', 2, true);


--
-- Name: bitacora bitacora_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bitacora
    ADD CONSTRAINT bitacora_pkey PRIMARY KEY (id);


--
-- Name: configuracion_sistema configuracion_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_sistema
    ADD CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (id);


--
-- Name: movimientos_inventario movimientos_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_pkey PRIMARY KEY (id);


--
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (id);


--
-- Name: recuperacion_password recuperacion_password_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recuperacion_password
    ADD CONSTRAINT recuperacion_password_pkey PRIMARY KEY (id);


--
-- Name: recuperacion_password recuperacion_password_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recuperacion_password
    ADD CONSTRAINT recuperacion_password_token_hash_key UNIQUE (token_hash);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: vinos vinos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vinos
    ADD CONSTRAINT vinos_pkey PRIMARY KEY (id);


--
-- Name: movimientos_inventario movimientos_inventario_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);


--
-- Name: movimientos_inventario movimientos_inventario_id_vino_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_id_vino_fkey FOREIGN KEY (id_vino) REFERENCES public.vinos(id);


--
-- Name: recuperacion_password recuperacion_password_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recuperacion_password
    ADD CONSTRAINT recuperacion_password_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: vinos vinos_id_proveedor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vinos
    ADD CONSTRAINT vinos_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES public.proveedores(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ggcTpMBF77aze7UyTrVl96MvaMBOEKKXld0v1d5E5IbwuG0LV3SD1sjd1HAmo1Y

