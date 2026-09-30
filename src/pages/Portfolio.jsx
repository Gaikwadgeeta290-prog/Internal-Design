import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight} from 'lucide-react';
import {Layout,Reveal} from '../components/Layout';
import ProjectCard from '../components/ProjectCard';
import Lightbox from '../components/Lightbox';

export default function Portfolio(){
  const [filter,setFilter]=useState('All');
  const [selected,setSelected]=useState(null);
  const [projects,setProjects]=useState([]);

  useEffect(() => {
    fetch("http://localhost:5050/api/projects")
      .then(res => res.json())
      .then(data => {
        if(data.ok){
          const mappedProjects=data.items.map(project => ({
            ...project,
            image: project.image_url
          }));

          setProjects(mappedProjects);
        }
      })
      .catch(error => {
        console.error("Failed to load projects:",error);
      });
  },[]);

  const cats=['All','Living','Bedroom','Kitchen','Dining'];

  const list=useMemo(
    () =>
      projects.filter(
        p => filter==='All'||p.category===filter
      ),
    [projects,filter]
  );

  const idx=selected
    ? projects.findIndex(p => p.id===selected.id)
    : -1;

  const heroProject=projects[0];

  return (
    <Layout>

      <section
        className="page-hero"
        style={{
          backgroundImage:heroProject?.image
            ? `linear-gradient(rgba(20,18,15,.22),rgba(20,18,15,.30)),url(${heroProject.image})`
            : 'linear-gradient(rgba(20,18,15,.22),rgba(20,18,15,.30))',
          backgroundSize:'cover',
          backgroundPosition:'center'
        }}
      >
        <Reveal>
          <span className="eyebrow">SELECTED WORK</span>

          <h1>
            A portfolio of <i>quietly bold</i> spaces.
          </h1>

          <p>
            Residential interiors shaped by proportion, material,
            light and the people who inhabit them.
          </p>
        </Reveal>
      </section>

      <section className="portfolio-wrap">

        <div className="filterbar">

          {cats.map(c => (
            <button
              className={filter===c?'selected':''}
              onClick={() => setFilter(c)}
              key={c}
            >
              {c}
            </button>
          ))}

          <span>
            {list.length.toString().padStart(2,'0')} PROJECTS
          </span>

        </div>

        <div className="portfolio-grid">

          {list.map((p,i) => (
            <ProjectCard
              key={p.id}
              p={p}
              index={i}
              onOpen={setSelected}
            />
          ))}

        </div>

      </section>

      <section className="portfolio-cta">

        <Reveal>

          <h2>Inspired by a space?</h2>

          <Link
            to="/begin-project"
            className="pill dark"
          >
            Start a conversation
            <ArrowUpRight/>
          </Link>

        </Reveal>

      </section>

      <Lightbox
        project={selected}
        onClose={() => setSelected(null)}
        onPrev={() =>
          projects[
            (idx-1+projects.length)%projects.length
          ]
        }
        onNext={() =>
          projects[
            (idx+1)%projects.length
          ]
        }
      />

    </Layout>
  );
}