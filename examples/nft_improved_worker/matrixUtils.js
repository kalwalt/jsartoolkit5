function multiplyMatrices(a, b) {
    var ae = a;
    var be = b;
    var te = new Float64Array(16);

    var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
    var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
    var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
    var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

    var b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
    var b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
    var b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
    var b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return te;
}

function transformPoint(m, xyz) {
    var x = xyz.x, y = xyz.y, z = xyz.z;
    var e = m;

    var w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

    var r = {};
    r.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    r.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    r.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

    return r;
}

function glpointToCanvas(xyz) {
    return {
        x: (xyz.x + 1) * 0.5 * pw / pscale * sscale - ox / pscale * sscale,
        y: (1 - xyz.y) * 0.5 * ph / pscale * sscale - oy / pscale * sscale,
        z: xyz.z,
    }
}
function drawpoint(pw, ph, ox, oy, pscale, sscale, mat, x, y, z) {
    var r = transformPoint(mat, {x: x, y: y, z: z});
    var c = glpointToCanvas(r);
    return c;
}

function findPoint(pw, ph, ox, oy, pscale, sscale, proj, world, marker) {
  var width = marker.width;
  var height = marker.height;
  var dpi = marker.dpi;

  var w = (width / dpi * 2.54 * 10)/2;
  var h = (height / dpi * 2.54 * 10)/2;
  console.log('factors: ' + w + ' '+ h );
  var mat = multiplyMatrices(proj, world);
  var posPoint = drawpoint(pw, ph, ox, oy, pscale, sscale, mat, w, h, 0);

  return posPoint;
}
