SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: songs; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE songs (
    id integer NOT NULL,
    server_id text NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    artist text,
    source_type text NOT NULL,
    source text NOT NULL,
    source_link text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);

--
-- Name: song_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--
CREATE SEQUENCE song_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: song_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--
ALTER SEQUENCE song_id_seq OWNED BY songs.id;

--
-- Name: songs id; Type: DEFAULT; Schema: public; Owner: -
--
ALTER TABLE ONLY songs ALTER COLUMN id SET DEFAULT nextval('song_id_seq'::regclass);

--
-- Name: songs song_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY songs
    ADD CONSTRAINT song_pkey PRIMARY KEY (id);

--
-- PostgreSQL database dump complete
--
