"use strict";

((step, perspective) => {

    const DIV = "div";
    const COLORS = [
        "#c33",
        "#ea4c88",
        "#639",
        "#06c",
        "#690",
        "#fc3",
        "#f90",
        "#963"
    ];

    function getColor(depth) {
        return COLORS[depth % (COLORS.length - 1)];
    }

    function getFaceHTML(x, y, z, width, height, rotateYDeg, color) {

        const multiLineToSingle = string =>
            string.trim().split("\n").map(string => string.trim()).join(" ");

        const common = multiLineToSingle(`
position: absolute;
transform-origin: left top;
        `);
        const visual = `background: ${color};`;
        const dimensions = multiLineToSingle(`
width: ${width}px;
height: ${height}px;
        `);

        const translate = `translate3d(${x}px, ${y}px, ${z}px)`;
        const rotate = `rotateX(${270}deg) rotateY(${rotateYDeg}deg)`;
        const transform = `transform: ${translate} ${rotate};`;

        return `<${DIV} style='${
            [common, visual, dimensions, transform].join(" ")
        }'></${DIV}>`;
    }

    const stepDelta = 0.001;
    let facesHTML = "";

    function traverse(element, depth, offsetLeft, offsetTop) {

        const childNodes = element.childNodes;
        const length = childNodes.length;

        for (let i = 0; i < length; i++) {
            const childNode = childNodes[i];

            if (childNode.nodeType === Node.ELEMENT_NODE) {
                childNode.style.overflow = "visible";
                childNode.style.transformStyle = "preserve-3d";
                childNode.style.transform = `translateZ(${(step + (length - i) * stepDelta).toFixed(3)}px)`;

                let elementBodyOffsetLeft = offsetLeft;
                let elementBodyOffsetTop = offsetTop;

                if (childNode.offsetParent === element) {
                    elementBodyOffsetLeft += element.offsetLeft;
                    elementBodyOffsetTop += element.offsetTop;
                }

                traverse(childNode, depth + 1, elementBodyOffsetLeft, elementBodyOffsetTop);

                const commonZ = (depth + 1) * step;
                const color = getColor(depth);

                // Top
                facesHTML += getFaceHTML(
                    elementBodyOffsetLeft + childNode.offsetLeft,
                    elementBodyOffsetTop + childNode.offsetTop,
                    commonZ,
                    childNode.offsetWidth,
                    step,
                    0,
                    color);

                // Right
                facesHTML += getFaceHTML(
                    elementBodyOffsetLeft + childNode.offsetLeft + childNode.offsetWidth,
                    elementBodyOffsetTop + childNode.offsetTop,
                    commonZ,
                    childNode.offsetHeight,
                    step,
                    270,
                    color);

                // Bottom
                facesHTML += getFaceHTML(
                    elementBodyOffsetLeft + childNode.offsetLeft,
                    elementBodyOffsetTop + childNode.offsetTop + childNode.offsetHeight,
                    commonZ,
                    childNode.offsetWidth,
                    step,
                    0,
                    color);

                // Left
                facesHTML += getFaceHTML(
                    elementBodyOffsetLeft + childNode.offsetLeft,
                    elementBodyOffsetTop + childNode.offsetTop,
                    commonZ,
                    childNode.offsetHeight,
                    step,
                    270,
                    color);
            }
        }
    }

    const body = document.body;
    body.style.overflow = "visible";
    body.style.transformStyle = "preserve-3d";
    body.style.perspective = perspective;

    const getCenterAsString = length => (length / 2).toFixed(2);
    const origin = `${getCenterAsString(innerWidth)}px ${getCenterAsString(innerHeight)}px`;
    body.style.perspectiveOrigin = origin;
    body.style.transformOrigin = origin;

    traverse(body, 0, 0, 0);

    const faces = document.createElement(DIV);
    faces.style.display = "none";
    faces.style.position = "absolute";
    faces.style.top = 0;
    faces.innerHTML = facesHTML;
    body.appendChild(faces);

    const Modes = {
        DISABLED: -1,
        NO_FACES: 0,
        FACES: 1
    };
    let mode = Modes.NO_FACES;

    document.addEventListener("mousemove", event => {

        if (mode !== Modes.DISABLED) {
            const xRel = event.screenX / screen.width;
            const yRel = 1 - (event.screenY / screen.height);
            const relToDegAsString = rel => (rel * 360 - 180).toFixed(2);
            body.style.transform = `rotateX(${relToDegAsString(yRel)}deg) rotateY(${relToDegAsString(xRel)}deg)`;
        }
    }, true);

    document.addEventListener("mouseup", () => {
        switch (mode) {

            case Modes.NO_FACES: {
                mode = Modes.FACES;
                faces.style.display = "";
                break;
            }

            case Modes.FACES: {
                mode = Modes.NO_FACES;
                faces.style.display = "none";
                break;
            }

            default: {
                throw new RangeError("Incorrect faces mode");
            }
        }
    }, true);
})(25, 5000);
