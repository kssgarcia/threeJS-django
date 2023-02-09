export default function HomeAnimation(gsap) {
  let t1_initial = gsap.timeline();
  t1_initial.from("nav", { duration: 1, yPercent: -100 });
  t1_initial.to(".hero .container .container-h1 .other-text", {
    duration: 0.5,
    y: "unset",
  });
  t1_initial.to(".hero .container .line-navbar", {
    duration: 0.5,
    width: "80vw",
  });
  t1_initial.to(".hero .container .container-p p", {
    duration: 0.5,
    y: "unset",
  });
  t1_initial.to(".hero .container .container-follow .follow-second-container", {
    duration: 0.5,
    autoAlpha: 1,
  });

  let t1_out = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "center center",
      end: "center 2em",
      scrub: 2,
      pin: true,
    },
  });
  t1_out.to(".hero .container .container-h1 h1", { duration: 2, autoAlpha: 0 });
  t1_out.to(".hero .container .line-navbar", { duration: 2, autoAlpha: 0 });
  t1_out.to(".hero .container .container-p p", { duration: 2, yPercent: 200 });
  t1_out.to(".hero .container .container-follow .follow-second-container", {
    duration: 2,
    xPercent: 100,
  });

  let t2_initial = gsap.timeline({
    scrollTrigger: {
      trigger: ".secundary-section",
      start: "top 80%",
      end: "center top",
    },
  });
  t2_initial.to(".secundary-section .container", {
    duration: 1,
    height: "80%",
  });
  t2_initial.to(".secundary-section .container .foto-container .my-image img", {
    duration: 0.6,
    height: "auto",
  });
  t2_initial.to(".secundary-section .container .description .text-content", {
    y: "unset",
    duration: 0.6,
    stagger: 0.2,
  });
  t2_initial.to(
    ".secundary-section .container .description .text-content .line",
    { width: "40vw", duration: 0.6, stagger: 0.2 }
  );

  let t2_out = gsap.timeline({
    scrollTrigger: {
      trigger: ".secundary-section",
      start: "center center",
      end: "center 2em",
      scrub: 2,
      pin: true,
    },
  });
  t2_out.to(".secundary-section .container .description .text-content .line", {
    x: "20vw",
    duration: 4,
    stagger: 0.5,
  });
  t2_out.to(".secundary-section .container .foto-container .my-image", {
    duration: 6,
    autoAlpha: 0,
  });
  t2_out.to(".secundary-section .container .description .text-content", {
    duration: 1,
    autoAlpha: 0,
    stagger: 0.3,
  });

  let t3_initial = gsap.timeline({
    scrollTrigger: {
      trigger: ".footer",
      start: "top center",
      end: "top center",
      toggleActions: "restart none reverse none",
    },
  });
  t3_initial.to(".footer .container .container-contact .c", {
    duration: 0.7,
    y: "unset",
  });
  t3_initial.to(".footer .container ul", { duration: 0.7, height: "30vh" });
  t3_initial.to(".footer .container ul li .contact-li", {
    duration: 0.7,
    y: "unset",
  });

  let forward = true;
  let t_navbar = gsap.timeline({ paused: true });
  let button_navbar = document.querySelector("nav .navbar .menu-button");
  const navbar_container = document.querySelector("nav .navbar-container");
  t_navbar.to("nav .navbar-container", {
    duration: 1,
    height: "90vh",
    ease: "Expo.easeInOut",
  });
  t_navbar.to(
    "nav .navbar-container ul li a",
    { duration: 0.5, y: "unset", stagger: 0.2, ease: "expo.easeinout" },
    "-=0.3"
  );
  t_navbar.to(
    "nav .navbar-container ul .line",
    { duration: 0.5, width: "40vw", stagger: 0.2, ease: "expo.easeinout" },
    "-=0.3"
  );

  let t_button = gsap.timeline({ paused: true });
  t_button.to("nav .menu-button .line-1", {
    duration: 0.2,
    rotation: 45,
    xPercent: -30,
    y: "10px",
    x: "7px",
  });
  t_button.to("nav .menu-button .line-2", {
    duration: 0.2,
    rotation: -45,
    xPercent: -30,
    x: "-7px",
  });

  button_navbar.addEventListener("click", () => {
    if (forward) {
      t_button.play();
      t_navbar.play();
      navbar_container.classList.remove("deactive");
    } else {
      t_button.reverse();
      t_navbar.reverse();
      navbar_container.classList.add("deactive");
    }
    forward = forward ? false : true;
  });

  let body = document.body,
    html = document.documentElement;
  let height = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
  document
    .querySelectorAll("nav .navbar-container .container ul li a")
    .forEach((elem, i) => {
      elem.addEventListener("click", () => {
        if (i === 0) {
          gsap.to(window, { duration: 3, scrollTo: 0 });
        } else if (i === 1) {
          gsap.to(window, { duration: 3, scrollTo: height / 2 });
        } else {
          gsap.to(window, { duration: 3, scrollTo: `#section-${i + 1}` });
        }
        t_button.reverse();
        t_navbar.reverse();
        forward = forward ? false : true;
      });
    });

  document
    .querySelector(".hero .container .container-follow a")
    .addEventListener("click", () => {
      gsap.to(window, { duration: 3, scrollTo: "#section-3" });
    });
  document
    .querySelector("nav .navbar .logo a")
    .addEventListener("click", () => {
      gsap.to(window, { duration: 3, scrollTo: 0 });
    });
}
