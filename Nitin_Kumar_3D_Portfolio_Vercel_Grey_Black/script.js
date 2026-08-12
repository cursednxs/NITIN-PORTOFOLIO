const card = document.getElementById("profileCard");
const stage = document.querySelector(".hero-right");

if (card && stage) {
  stage.addEventListener("pointermove", e => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateY(${x * 18 - 10}deg) rotateX(${-y * 12 + 4}deg) translateZ(10px)`;
  });
  stage.addEventListener("pointerleave", () => {
    card.style.transform = "rotateY(-10deg) rotateX(4deg)";
  });
}

if (window.THREE) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 100);
  camera.position.z = 7;

  const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  document.getElementById("scene").appendChild(renderer.domElement);

  const geometry = new THREE.IcosahedronGeometry(1.7,1);
  const material = new THREE.MeshBasicMaterial({
    color:0xaaaaaa, wireframe:true, transparent:true, opacity:.13
  });
  const object = new THREE.Mesh(geometry,material);
  object.position.set(2.4,.2,-1.5);
  scene.add(object);

  const count = 600;
  const positions = new Float32Array(count*3);
  for(let i=0;i<positions.length;i++) positions[i]=(Math.random()-.5)*17;
  const stars = new THREE.BufferGeometry();
  stars.setAttribute("position",new THREE.BufferAttribute(positions,3));
  const starMat = new THREE.PointsMaterial({color:0xcccccc,size:.012,transparent:true,opacity:.4});
  const points = new THREE.Points(stars,starMat);
  scene.add(points);

  let tx=0,ty=0;
  addEventListener("pointermove",e=>{
    tx=(e.clientX/innerWidth-.5)*.25;
    ty=(e.clientY/innerHeight-.5)*.16;
  });

  function animate(){
    requestAnimationFrame(animate);
    object.rotation.x += .0015;
    object.rotation.y += .0024;
    points.rotation.y += .00025;
    object.rotation.x += (ty-object.rotation.x)*.003;
    object.rotation.y += (tx-object.rotation.y)*.003;
    renderer.render(scene,camera);
  }
  animate();

  addEventListener("resize",()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });
}

const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.animate(
        [{opacity:0,transform:"translateY(18px)"},{opacity:1,transform:"translateY(0)"}],
        {duration:650,easing:"cubic-bezier(.2,.7,.2,1)",fill:"forwards"}
      );
      observer.unobserve(entry.target);
    }
  });
},{threshold:.08});
document.querySelectorAll(".experience,.project,.numbers div,.contact-panel").forEach(el=>observer.observe(el));
