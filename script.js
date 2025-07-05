window.onload = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#mainCanvas'), 
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(0, 0, 500);

    const sphereGeometry = new THREE.SphereGeometry(8, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load('naari3.png'),
        metalness: 0.05,
        roughness: 0.5
    });

    const sphereMeshSec = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const sphereMeshMin = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const sphereMeshHour = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMeshMin.scale.set(1.2, 1.2, 1.2);
    sphereMeshHour.scale.set(1.6, 1.6, 1.6);
    scene.add(sphereMeshSec);
    scene.add(sphereMeshMin);
    scene.add(sphereMeshHour);

    const sphereMeshCenter = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMeshCenter.scale.set(1.3, 1.3, 1.3);
    scene.add(sphereMeshCenter);

    // 針を作成
    const createNeedle = (length, thickness) => {
        const geometry = new THREE.CylinderGeometry(thickness, thickness, length, 32);
        const material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load('naari3.png'),
            metalness: 0.05,
            roughness: 0.5
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, length / 2, 0);
        return mesh;
    }

    const rotateNeedle = (needle, angle, length) => {
        needle.rotation.z = -angle + Math.PI / 2;
        needle.position.set(-Math.cos(angle) * (length / 2 + 13), Math.sin(angle) * (length / 2 + 13), 0);
    }

    const secNeedleLength = 86;
    const minNeedleLength = 74;
    const hourNeedleLength = 50;

    const secNeedle = createNeedle(secNeedleLength, 1);
    const minNeedle = createNeedle(minNeedleLength, 1.5);
    const hourNeedle = createNeedle(hourNeedleLength, 2.5);
    scene.add(secNeedle);
    scene.add(minNeedle);
    scene.add(hourNeedle);

    for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2;
        const x = -120 * Math.cos(angle);
        const y = 120 * Math.sin(angle);
        const geometry = new THREE.CylinderGeometry(1, 1, i % 5 === 0 ? 13 : 7, 32);
        const material = new THREE.MeshStandardMaterial({
            //color: i % 5 === 0 ? 0xffffff : 0x888888,
            map: new THREE.TextureLoader().load('naari3.png'),
            metalness: 0.05,
            roughness: 0.5
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, 0);
        mesh.rotation.z = -angle + Math.PI / 2;
        scene.add(mesh);
    }


    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(800, 800, 1000);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x6284cd, 0.7);
    fillLight.position.set(-700, -700, -500);
    scene.add(fillLight);

    const limLight = new THREE.DirectionalLight(0xffffff, 0.7);
    limLight.position.set(0, -100, -1000);
    scene.add(limLight);

    window.addEventListener('mousemove', (event) => {
        const mouseX = (event.clientX / width) * 2 - 1;
        const mouseY = -(event.clientY / height) * 2 + 1;
        camera.position.x = Math.log(Math.abs(mouseX)+ 1) * 100 * Math.sign(mouseX);
        camera.position.y = Math.log(Math.abs(mouseY)+ 1) * 100 * Math.sign(mouseY);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    });

    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
    });

    window.addEventListener('wheel', (event) => {
        const delta = event.deltaY > 0 ? 1.1 : 0.9;
        camera.position.z *= delta;
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    });



    const tick = () => {
        requestAnimationFrame(tick);
        const now = new Date();
        const todayBegin = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const delta = now.getTime() - todayBegin.getTime();
        const mSec = now.getMilliseconds();
        const sec = now.getSeconds();
        const min = now.getMinutes();
        const hour = now.getHours();
        const secAngle = (sec - (mSec / 1000 - 1) ** 16) / 60 * Math.PI * 2 + Math.PI / 2;
        const minAngle = (min + sec / 60 + mSec / 60000) / 60 * Math.PI * 2 + Math.PI / 2;
        const hourAngle = ((hour % 12) / 12) * Math.PI * 2 + (min / 60) * (Math.PI / 6) + Math.PI / 2;
        const radiusSec = 110;
        const radiusMin = 100;
        const radiusHour = 80;
        const secX = -radiusSec * Math.cos(secAngle);
        const secY = radiusSec * Math.sin(secAngle);
        const minX = -radiusMin * Math.cos(minAngle);
        const minY = radiusMin * Math.sin(minAngle);
        const hourX = -radiusHour * Math.cos(hourAngle);
        const hourY = radiusHour * Math.sin(hourAngle);
        sphereMeshHour.position.set(hourX, hourY, 0);
        sphereMeshMin.position.set(minX, minY, 0);
        sphereMeshSec.position.set(secX, secY, 0);
        sphereMeshSec.rotation.y = (delta / 60000) * Math.PI * 2;
        sphereMeshMin.rotation.y = (delta / 3600000) * Math.PI * 2;
        sphereMeshHour.rotation.y = (delta / 86400000) * Math.PI * 2;

        if (min == 0 && 0 <= sec && sec < 2) {
            sphereMeshCenter.rotation.y = mSec / 1000 * Math.PI * 2;
        }

        rotateNeedle(secNeedle, secAngle, secNeedleLength);
        rotateNeedle(minNeedle, minAngle, minNeedleLength);
        rotateNeedle(hourNeedle, hourAngle, hourNeedleLength);

        renderer.render(scene, camera);
    }
    tick();
}