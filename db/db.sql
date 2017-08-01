SET search_path = public, pg_catalog;
SET default_tablespace = '';
SET default_with_oids = false;

--
-- Name: playlist_elements; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE playlist_elements (
    playlist_id integer NOT NULL,
    song_id integer NOT NULL,
    "position" integer NOT NULL
);

--
-- Name: playlist_elements_playlist_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--
CREATE SEQUENCE playlist_elements_playlist_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: playlist_elements_playlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--
ALTER SEQUENCE playlist_elements_playlist_id_seq OWNED BY playlist_elements.playlist_id;

--
-- Name: playlist_elements_song_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--
CREATE SEQUENCE playlist_elements_song_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: playlist_elements_song_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--
ALTER SEQUENCE playlist_elements_song_id_seq OWNED BY playlist_elements.song_id;

--
-- Name: playlists; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE playlists (
    id integer NOT NULL,
    server_id text NOT NULL,
    user_id text NOT NULL,
    name text NOT NULL
);

--
-- Name: playlists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--
CREATE SEQUENCE playlists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: playlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--
ALTER SEQUENCE playlists_id_seq OWNED BY playlists.id;

--
-- Name: server_members; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE server_members (
    server_id text NOT NULL,
    user_id text NOT NULL,
    name text NOT NULL,
    created timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: servers; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE servers (
    id text NOT NULL,
    name text,
    created timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: songs; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE songs (
    id integer NOT NULL,
    server_id text NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    artist text,
    source_type text DEFAULT 'FILE'::text NOT NULL,
    source text NOT NULL
);

--
-- Name: songs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--
CREATE SEQUENCE songs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: songs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--
ALTER SEQUENCE songs_id_seq OWNED BY songs.id;

--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--
CREATE TABLE users (
    id text NOT NULL,
    name text NOT NULL,
    created timestamp with time zone DEFAULT now() NOT NULL,
    discriminator integer DEFAULT 0 NOT NULL
);

--
-- Name: playlist_elements playlist_id; Type: DEFAULT; Schema: public; Owner: -
--
ALTER TABLE ONLY playlist_elements ALTER COLUMN playlist_id SET DEFAULT nextval('playlist_elements_playlist_id_seq'::regclass);

--
-- Name: playlist_elements song_id; Type: DEFAULT; Schema: public; Owner: -
--
ALTER TABLE ONLY playlist_elements ALTER COLUMN song_id SET DEFAULT nextval('playlist_elements_song_id_seq'::regclass);

--
-- Name: playlists id; Type: DEFAULT; Schema: public; Owner: -
--
ALTER TABLE ONLY playlists ALTER COLUMN id SET DEFAULT nextval('playlists_id_seq'::regclass);

--
-- Name: songs id; Type: DEFAULT; Schema: public; Owner: -
--
ALTER TABLE ONLY songs ALTER COLUMN id SET DEFAULT nextval('songs_id_seq'::regclass);

--
-- Name: users new_table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY users
    ADD CONSTRAINT new_table_pkey PRIMARY KEY (id);

--
-- Name: playlist_elements playlist_elements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY playlist_elements
    ADD CONSTRAINT playlist_elements_pkey PRIMARY KEY (playlist_id, song_id);

--
-- Name: playlists playlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY playlists
    ADD CONSTRAINT playlists_pkey PRIMARY KEY (id);

--
-- Name: server_members server_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY server_members
    ADD CONSTRAINT server_members_pkey PRIMARY KEY (server_id, user_id);

--
-- Name: servers servers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY servers
    ADD CONSTRAINT servers_pkey PRIMARY KEY (id);

--
-- Name: songs songs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY songs
    ADD CONSTRAINT songs_pkey PRIMARY KEY (id);

--
-- Name: server_members fk_servers_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY server_members
    ADD CONSTRAINT fk_servers_id FOREIGN KEY (server_id) REFERENCES servers(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: server_members fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY server_members
    ADD CONSTRAINT fk_users_id FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: playlist_elements playlist_elements_playlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY playlist_elements
    ADD CONSTRAINT playlist_elements_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: playlist_elements playlist_elements_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY playlist_elements
    ADD CONSTRAINT playlist_elements_song_id_fkey FOREIGN KEY (song_id) REFERENCES songs(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: playlists playlists_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY playlists
    ADD CONSTRAINT playlists_server_id_fkey FOREIGN KEY (server_id) REFERENCES servers(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: playlists playlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY playlists
    ADD CONSTRAINT playlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: songs songs_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY songs
    ADD CONSTRAINT songs_server_id_fkey FOREIGN KEY (server_id) REFERENCES servers(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

--
-- Name: songs songs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY songs
    ADD CONSTRAINT songs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

--
-- PostgreSQL database dump complete
--
