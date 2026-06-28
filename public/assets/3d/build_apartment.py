"""
Roshan Apartments — Production 3D Model (CC0 Furniture Edition)
NR Constructions, Corlim, North Goa

Run from Blender 3.6+ Scripting workspace.
First run requires internet access to download CC0 assets from Poly Haven.
All assets are cached to the OS temp directory after the first download.

After running: File → Export → glTF 2.0 (.glb)
  ✓ Apply Modifiers  ✓ Draco compression  Format: Binary (.glb)

CC0 furniture assets — polyhaven.com/models (Creative Commons Zero)
"""

import bpy
import bmesh
import math
import pathlib
import tempfile
import urllib.request
from mathutils import Vector, Matrix

# ══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ══════════════════════════════════════════════════════════════════════════════
WH   = 2.85   # wall height (m)
WT   = 0.23   # wall thickness (9-inch brick)
FH   = 0.12   # floor slab thickness
DH   = 2.10   # door height
SDH  = 2.40   # sliding door height
DW   = 0.90   # door width
WW   = 1.20   # window width
WWH  = 1.20   # window height
WSH  = 0.90   # window sill height

# ══════════════════════════════════════════════════════════════════════════════
# POLY HAVEN CC0 ASSET SYSTEM
# ══════════════════════════════════════════════════════════════════════════════
#
# All models: https://polyhaven.com/models  —  CC0 licence
# URL: https://dl.polyhaven.org/file/ph-assets/Models/blend/{res}/{id}/{id}_{res}.blend
# Textures are packed inside each .blend file — no separate downloads needed.
#
PH_RES   = "1k"    # 1k ≈ 500 KB per asset; swap to "2k" for higher detail
PH_CACHE = pathlib.Path(tempfile.gettempdir()) / "ph_blend_cache"
PH_CACHE.mkdir(exist_ok=True)

_asset_instance_count: dict[str, int] = {}


def ph_download(asset_id: str) -> pathlib.Path | None:
    """Return local path to the .blend file, downloading once if needed."""
    local = PH_CACHE / f"{asset_id}_{PH_RES}.blend"
    if local.exists():
        return local
    url = (
        f"https://dl.polyhaven.org/file/ph-assets/Models/blend"
        f"/{PH_RES}/{asset_id}/{asset_id}_{PH_RES}.blend"
    )
    print(f"  [PH] Downloading {asset_id}… ", end="", flush=True)
    try:
        urllib.request.urlretrieve(url, str(local))
        print(f"✓  ({local.stat().st_size // 1024} KB)")
        return local
    except Exception as exc:
        print(f"✗  {exc}")
        return None


def place_ph_asset(
    asset_id: str,
    target_coll: bpy.types.Collection,
    loc: tuple[float, float, float],
    rot_z: float = 0.0,
    target_width: float | None = None,
    prefix: str | None = None,
) -> list[bpy.types.Object]:
    """
    Download (cached), import, scale, and place a Poly Haven .blend asset.

    Parameters
    ----------
    asset_id      Poly Haven slug, e.g. "Sofa_01"
    target_coll   Blender collection to link the objects into
    loc           (x, y, z) world-space placement — asset origin lands here.
                  PH assets place their origin at bottom-centre of the mesh.
    rot_z         Z-axis rotation in radians
    target_width  Rescale so the asset's X extent equals this value (metres).
                  None = keep original PH scale (real-world metres).
    prefix        Name prefix; defaults to asset_id
    """
    blend_path = ph_download(asset_id)
    if blend_path is None:
        return []

    count = _asset_instance_count.get(asset_id, 0)
    _asset_instance_count[asset_id] = count + 1
    pfx = f"{prefix or asset_id}_{count:02d}"

    # ── Import all objects from the blend file ─────────────────────────────
    pre_names = {o.name for o in bpy.data.objects}
    with bpy.data.libraries.load(str(blend_path), link=False) as (src, dst):
        dst.objects = list(src.objects)

    imported = [o for o in bpy.data.objects if o.name not in pre_names]
    if not imported:
        print(f"  [PH] No objects found in {asset_id}")
        return []

    # Move to target collection
    for obj in imported:
        for c in list(obj.users_collection):
            c.objects.unlink(obj)
        target_coll.objects.link(obj)

    # Force depsgraph update so bound_box values are correct
    bpy.context.view_layer.update()

    # ── Compute bounding box in world space ────────────────────────────────
    lo = Vector(( 1e9,  1e9,  1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for obj in imported:
        if obj.type != "MESH" or not obj.data:
            continue
        for co in obj.bound_box:
            wco = obj.matrix_world @ Vector(co)
            if wco.x < lo.x: lo.x = wco.x
            if wco.y < lo.y: lo.y = wco.y
            if wco.z < lo.z: lo.z = wco.z
            if wco.x > hi.x: hi.x = wco.x
            if wco.y > hi.y: hi.y = wco.y
            if wco.z > hi.z: hi.z = wco.z

    extent_x = hi.x - lo.x
    sf = (target_width / extent_x) if (target_width and extent_x > 1e-4) else 1.0

    # ── Create a pivot Empty to own all transforms ─────────────────────────
    pivot = bpy.data.objects.new(f"{pfx}_pivot", None)
    pivot.empty_display_type = "ARROWS"
    pivot.empty_display_size = 0.05
    target_coll.objects.link(pivot)

    # Identify root objects (no parent, or parent outside this import batch)
    imp_names = {o.name for o in imported}
    roots = [o for o in imported if o.parent is None or o.parent.name not in imp_names]
    for obj in roots:
        obj.parent = pivot
        obj.matrix_parent_inverse = Matrix.Identity(4)

    # Rename
    for i, obj in enumerate(imported):
        obj.name = f"{pfx}_{i:02d}"
        if obj.data:
            obj.data.name = f"{pfx}_{i:02d}"

    # ── Apply transform via pivot ──────────────────────────────────────────
    # PH assets typically have their mesh origin at bottom-centre.
    # Setting pivot.location = loc places the asset at loc.
    # Scale and rotation are applied around the pivot (= asset origin).
    pivot.location       = Vector(loc)
    pivot.rotation_euler = (0.0, 0.0, rot_z)
    pivot.scale          = (sf, sf, sf)

    return imported + [pivot]


# ══════════════════════════════════════════════════════════════════════════════
# GENERAL UTILITIES  (architecture, kitchen, bathrooms)
# ══════════════════════════════════════════════════════════════════════════════

MAT: dict[str, bpy.types.Material] = {}


# ── Blender version-safe shader helpers ───────────────────────────────────────
# Socket names changed significantly between Blender 3.x → 4.0 → 5.x.
# These wrappers make every access a no-op when a socket or property no longer
# exists, avoiding KeyError / AttributeError on newer builds.

def _si(node, name, value) -> bool:
    """Set a node *input* socket value safely. Returns True if the socket exists."""
    if name in node.inputs:
        node.inputs[name].default_value = value
        return True
    return False


def _np(node, name, value) -> bool:
    """Set a node *property* safely. Returns True if the attribute exists."""
    if hasattr(node, name):
        try:
            setattr(node, name, value)
            return True
        except (AttributeError, TypeError, RuntimeError):
            pass
    return False


def _inp(node, *names):
    """Return the first existing input socket matching any of the given names."""
    for n in names:
        if n in node.inputs:
            return node.inputs[n]
    return node.inputs[0] if node.inputs else None


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for m in bpy.data.meshes:    bpy.data.meshes.remove(m)
    for m in bpy.data.materials: bpy.data.materials.remove(m)


def coll(name, parent=None):
    c = bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(c)
    return c


def set_smooth(obj, angle=30):
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()
    # use_auto_smooth was removed in Blender 4.1; fall back to the new operator.
    if hasattr(obj.data, "use_auto_smooth"):
        obj.data.use_auto_smooth = True
        obj.data.auto_smooth_angle = math.radians(angle)
    elif hasattr(bpy.ops.object, "shade_smooth_by_angle"):
        try:
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))
        except Exception:
            pass


def add_bevel(obj, width=0.015, segs=2):
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width        = width
    mod.segments     = segs
    mod.limit_method = "ANGLE"
    mod.angle_limit  = math.radians(60)


def mat_plain(name, color, roughness=0.7, metallic=0.0, alpha=1.0,
              emission=None, ior=1.45, transmission=0.0):
    if name in MAT: return MAT[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out  = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    _si(bsdf, "Base Color", (*color, 1.0))
    _si(bsdf, "Roughness",  roughness)
    _si(bsdf, "Metallic",   metallic)
    _si(bsdf, "IOR",        ior)
    if transmission > 0:
        # "Transmission Weight" in Blender 4.0+; "Transmission" in 3.x
        if not _si(bsdf, "Transmission Weight", transmission):
            _si(bsdf, "Transmission", transmission)
        try:
            m.blend_method  = "BLEND"
            m.shadow_method = "NONE"
        except (AttributeError, TypeError):
            pass
    if emission:
        # "Emission Color" / "Emission Strength" in Blender 4.0+; "Emission" in 3.x
        if not _si(bsdf, "Emission Color", (*emission, 1.0)):
            _si(bsdf, "Emission", (*emission, 1.0))
        _si(bsdf, "Emission Strength", 2.0)
    if alpha < 1.0:
        try:
            m.blend_method = "BLEND"
        except (AttributeError, TypeError):
            pass
        _si(bsdf, "Alpha", alpha)
    MAT[name] = m; return m


def mat_marble():
    name = "Marble_Floor"
    if name in MAT: return MAT[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out   = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf  = nt.nodes.new("ShaderNodeBsdfPrincipled")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    wave  = nt.nodes.new("ShaderNodeTexWave")
    ramp  = nt.nodes.new("ShaderNodeValToRGB")
    # ShaderNodeMixRGB is the legacy name; Blender 4.0+ may expose it as
    # ShaderNodeMix with RGBA data_type and renamed sockets ("Factor","A","B").
    # Try creating it and probe which socket names are actually present.
    try:
        mix = nt.nodes.new("ShaderNodeMixRGB")
    except RuntimeError:
        mix = nt.nodes.new("ShaderNodeMix")
        _np(mix, "data_type", "RGBA")
    _np(mix, "blend_type", "MULTIPLY")
    _si(mix, "Fac",    0.4)   # Blender 3.x socket name
    _si(mix, "Factor", 0.4)   # Blender 4+ socket name (no-op if not present)
    coord = nt.nodes.new("ShaderNodeTexCoord")
    sc    = nt.nodes.new("ShaderNodeMapping")
    _si(noise, "Scale",     6.0)
    _si(noise, "Detail",    12.0)
    _si(noise, "Roughness", 0.6)
    _si(wave,  "Scale",     3.0)
    _si(wave,  "Distortion", 2.0)
    ramp.color_ramp.elements[0].color = (0.90, 0.88, 0.85, 1)
    ramp.color_ramp.elements[1].color = (0.78, 0.75, 0.72, 1)
    nt.links.new(coord.outputs["Generated"], _inp(sc,    "Vector"))
    nt.links.new(sc.outputs["Vector"],       _inp(noise, "Vector"))
    nt.links.new(sc.outputs["Vector"],       _inp(wave,  "Vector"))
    nt.links.new(noise.outputs[0],           _inp(ramp,  "Fac"))
    nt.links.new(ramp.outputs[0],            _inp(mix,   "Color1", "A"))
    nt.links.new(wave.outputs[0],            _inp(mix,   "Color2", "B"))
    nt.links.new(mix.outputs[0],             _inp(bsdf,  "Base Color"))
    _si(bsdf, "Roughness",       0.08)
    # "Specular IOR Level" in Blender 4.0+; "Specular" in 3.x
    if not _si(bsdf, "Specular IOR Level", 0.9):
        _si(bsdf, "Specular", 0.9)
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    MAT[name] = m; return m


def mat_wood(name="Wood_Floor", color=(0.42, 0.28, 0.14)):
    if name in MAT: return MAT[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out   = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf  = nt.nodes.new("ShaderNodeBsdfPrincipled")
    wave  = nt.nodes.new("ShaderNodeTexWave")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    bump  = nt.nodes.new("ShaderNodeBump")
    ramp  = nt.nodes.new("ShaderNodeValToRGB")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    sc    = nt.nodes.new("ShaderNodeMapping")
    _si(sc, "Scale", (8.0, 1.0, 1.0))
    _np(wave, "wave_type", "BANDS")
    _si(wave,  "Scale",      6.0)
    _si(wave,  "Distortion", 3.0)
    _si(noise, "Scale",      18.0)
    _si(noise, "Detail",     4.0)
    c0 = (color[0]*0.9, color[1]*0.9, color[2]*0.9)
    ramp.color_ramp.elements[0].color = (*c0,    1)
    ramp.color_ramp.elements[1].color = (*color, 1)
    _si(bump, "Strength", 0.2)
    nt.links.new(coord.outputs["Generated"], _inp(sc,    "Vector"))
    nt.links.new(sc.outputs["Vector"],       _inp(wave,  "Vector"))
    nt.links.new(sc.outputs["Vector"],       _inp(noise, "Vector"))
    nt.links.new(wave.outputs[1],            _inp(ramp,  "Fac"))     # outputs[1]="Factor"
    nt.links.new(ramp.outputs[0],            _inp(bsdf,  "Base Color"))
    nt.links.new(noise.outputs[0],           _inp(bump,  "Height"))
    nt.links.new(bump.outputs["Normal"],     _inp(bsdf,  "Normal"))
    _si(bsdf, "Roughness", 0.35)
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    MAT[name] = m; return m


def mat_tile(name="Tile", color=(0.92, 0.92, 0.92), grout=(0.55, 0.55, 0.55), tile_size=0.3):
    if name in MAT: return MAT[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out   = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf  = nt.nodes.new("ShaderNodeBsdfPrincipled")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    sc    = nt.nodes.new("ShaderNodeMapping")
    brick = nt.nodes.new("ShaderNodeTexBrick")
    bump  = nt.nodes.new("ShaderNodeBump")
    _si(sc, "Scale", (1/tile_size, 1/tile_size, 1.0))
    _si(brick, "Color1",        (*color, 1))
    _si(brick, "Color2",        (*color, 1))
    _si(brick, "Mortar",        (*grout, 1))
    _si(brick, "Mortar Size",   0.04)
    _si(brick, "Mortar Smooth", 0.2)
    _si(brick, "Scale",         1.0)
    # "Squash" was an input socket in Blender 3.x but became a node property
    # in Blender 4.0+ — access it as node.squash, not via inputs[].
    _si(brick, "Squash",        1.0)   # 3.x socket (no-op in 4+/5+)
    _np(brick, "squash",        1.0)   # 4.0+ node property
    _si(brick, "Squash Frequency", 2)  # 3.x socket (no-op in 4+/5+)
    _np(brick, "squash_frequency", 2)  # 4.0+ node property
    _si(bump, "Strength", 0.15)
    nt.links.new(coord.outputs["Generated"], _inp(sc,    "Vector"))
    nt.links.new(sc.outputs["Vector"],       _inp(brick, "Vector"))
    nt.links.new(brick.outputs[0],           _inp(bsdf,  "Base Color"))  # outputs[0]="Color"
    nt.links.new(brick.outputs[1],           _inp(bump,  "Height"))      # outputs[1]="Fac"
    nt.links.new(bump.outputs["Normal"],     _inp(bsdf,  "Normal"))
    _si(bsdf, "Roughness", 0.12)
    if not _si(bsdf, "Specular IOR Level", 0.7):
        _si(bsdf, "Specular", 0.7)
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    MAT[name] = m; return m


def mat_granite():
    name = "Granite"
    if name in MAT: return MAT[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out   = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf  = nt.nodes.new("ShaderNodeBsdfPrincipled")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    ramp  = nt.nodes.new("ShaderNodeValToRGB")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    _si(noise, "Scale",  28.0)
    _si(noise, "Detail", 16.0)
    ramp.color_ramp.elements[0].color = (0.08, 0.08, 0.10, 1)
    ramp.color_ramp.elements[1].color = (0.45, 0.42, 0.40, 1)
    e2 = ramp.color_ramp.elements.new(0.5); e2.color = (0.35, 0.32, 0.30, 1)
    nt.links.new(coord.outputs["Generated"], _inp(noise, "Vector"))
    nt.links.new(noise.outputs[0],           _inp(ramp,  "Fac"))
    nt.links.new(ramp.outputs[0],            _inp(bsdf,  "Base Color"))
    _si(bsdf, "Roughness", 0.08)
    if not _si(bsdf, "Specular IOR Level", 0.9):
        _si(bsdf, "Specular", 0.9)
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    MAT[name] = m; return m


def mat_glass(name="Glass"):
    return mat_plain(name, (0.85, 0.93, 0.97), roughness=0.02, ior=1.52, transmission=0.95)


def mat_brushed_metal(name="BrushedMetal", color=(0.72, 0.72, 0.72)):
    if name in MAT: return MAT[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out  = nt.nodes.new("ShaderNodeOutputMaterial")
    # ShaderNodeBsdfAnisotropic was deprecated in Blender 4.1 and may be
    # removed in 5.x — fall back to Principled BSDF with anisotropy inputs.
    try:
        bsdf = nt.nodes.new("ShaderNodeBsdfAnisotropic")
        _si(bsdf, "Color",      (*color, 1))
        _si(bsdf, "Roughness",  0.15)
        _si(bsdf, "Anisotropy", 0.6)
    except RuntimeError:
        bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
        _si(bsdf, "Base Color",  (*color, 1))
        _si(bsdf, "Metallic",    1.0)
        _si(bsdf, "Roughness",   0.15)
        _si(bsdf, "Anisotropic", 0.6)
        _si(bsdf, "Anisotropy",  0.6)  # alternative name in some builds
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    MAT[name] = m; return m


def assign(obj, mat_or_name):
    m = mat_or_name if not isinstance(mat_or_name, str) else MAT.get(mat_or_name)
    if m is None: return
    if obj.data.materials: obj.data.materials[0] = m
    else:                  obj.data.materials.append(m)


# ── Mesh helpers ──────────────────────────────────────────────────────────────

def box(name, loc, size, collection, material=None):
    x, y, z    = loc
    lx, ly, lz = size
    verts = [
        (x,    y,    z),   (x+lx, y,    z),   (x+lx, y+ly, z),   (x,    y+ly, z),
        (x,    y,    z+lz),(x+lx, y,    z+lz),(x+lx, y+ly, z+lz),(x,    y+ly, z+lz),
    ]
    faces = [(0,1,2,3),(7,6,5,4),(0,1,5,4),(2,3,7,6),(0,3,7,4),(1,2,6,5)]
    mesh = bpy.data.meshes.new(name); bm = bmesh.new()
    bvs  = [bm.verts.new(v) for v in verts]; bm.verts.ensure_lookup_table()
    for f in faces: bm.faces.new([bvs[i] for i in f])
    bm.to_mesh(mesh); bm.free(); mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    if material: assign(obj, material)
    return obj


def rounded_box(name, loc, size, bevel_r, collection, material=None):
    obj = box(name, loc, size, collection, material)
    add_bevel(obj, width=bevel_r, segs=3); set_smooth(obj)
    return obj


def cylinder(name, loc, radius, height, segs, collection, material=None, smooth=True):
    mesh = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_cylinder(bm, cap_ends=True, cap_tris=False,
                               segments=segs, radius1=radius, radius2=radius, depth=height)
    bm.to_mesh(mesh); bm.free()
    obj = bpy.data.objects.new(name, mesh); obj.location = loc
    collection.objects.link(obj)
    if material: assign(obj, material)
    if smooth:   set_smooth(obj)
    return obj


# ══════════════════════════════════════════════════════════════════════════════
# ARCHITECTURE — Walls with openings (segment method, no booleans)
# ══════════════════════════════════════════════════════════════════════════════

def wall_with_openings(name, x1, y1, x2, y2, openings, collection,
                       height=WH, thick=WT, material=None):
    length = math.hypot(x2-x1, y2-y1)
    angle  = math.atan2(y2-y1, x2-x1)
    cuts   = sorted(openings) if openings else []

    def span(s0, s1, z0, z1, sfx):
        if s1 <= s0 or z1 <= z0: return
        verts = [
            (s0,0,z0),(s1,0,z0),(s1,thick,z0),(s0,thick,z0),
            (s0,0,z1),(s1,0,z1),(s1,thick,z1),(s0,thick,z1),
        ]
        faces = [(0,1,2,3),(7,6,5,4),(0,1,5,4),(2,3,7,6),(0,3,7,4),(1,2,6,5)]
        mesh = bpy.data.meshes.new(name+sfx); bm = bmesh.new()
        bvs  = [bm.verts.new(v) for v in verts]; bm.verts.ensure_lookup_table()
        for f in faces: bm.faces.new([bvs[i] for i in f])
        bm.to_mesh(mesh); bm.free(); mesh.update()
        o = bpy.data.objects.new(name+sfx, mesh)
        o.rotation_euler[2] = angle; o.location = (x1, y1, 0)
        collection.objects.link(o)
        if material: assign(o, material)

    prev = 0.0
    for idx, (os, ow, oz0, oz1) in enumerate(cuts):
        oe = os + ow
        span(prev, os, 0, height,   f"_{idx}pre")
        span(os,   oe, 0, oz0,      f"_{idx}bot")
        span(os,   oe, oz1, height, f"_{idx}top")
        prev = oe
    span(prev, length, 0, height, "_tail")


# ══════════════════════════════════════════════════════════════════════════════
# PROCEDURAL FIXTURES  (no suitable CC0 assets available)
# ══════════════════════════════════════════════════════════════════════════════

def make_kitchen(loc, collection):
    x, y, z = loc
    M_base = mat_plain("KC_Body",   (0.92, 0.88, 0.85), 0.30)
    M_door = mat_plain("KC_Door",   (0.94, 0.90, 0.88), 0.15)
    M_ctp  = mat_granite()
    M_up   = mat_plain("KC_Upper",  (0.92, 0.88, 0.85), 0.30)
    M_sink = mat_brushed_metal("Sink", (0.75, 0.75, 0.75))
    M_appl = mat_plain("Appliance", (0.20, 0.20, 0.22), 0.25)
    M_chim = mat_plain("Chimney",   (0.18, 0.18, 0.20), 0.15, metallic=0.7)
    M_gl   = mat_plain("GlassCab", (0.80, 0.88, 0.92), 0.05, alpha=0.4)

    lc_d, lc_h, ctp_t, lc_w = 0.60, 0.87, 0.04, 2.20
    box("LC_Body", (x,y,z), (lc_w, lc_d, lc_h), collection, M_base)
    for i in range(3):
        dw = lc_w / 3
        rounded_box(f"LC_Dr{i}", (x+i*dw+0.01, y-0.005, z+0.02),
                    (dw-0.02, 0.02, lc_h-0.04), 0.01, collection, M_door)
    rounded_box("LC_CTop", (x-0.02, y-0.02, z+lc_h),
                (lc_w+0.04, lc_d+0.04, ctp_t), 0.01, collection, M_ctp)

    sx = x + lc_w
    box("Sink_Body",  (sx,y,z), (0.80, lc_d, lc_h), collection, M_base)
    rounded_box("Sink_CTop",  (sx-0.01, y-0.02, z+lc_h), (0.82, lc_d+0.04, ctp_t), 0.01, collection, M_ctp)
    box("Sink_Basin", (sx+0.15, y+0.10, z+lc_h-0.15), (0.52, 0.36, 0.15), collection, M_sink)
    cylinder("Tap_Body",  (sx+0.42, y+0.12, z+lc_h+ctp_t), 0.018, 0.18, 8, collection, M_sink)
    box("Tap_Spout",      (sx+0.41, y+0.12, z+lc_h+ctp_t+0.15), (0.03, 0.25, 0.03), collection, M_sink)

    ec_w = 0.60
    box("EC_Body", (x+lc_w+0.80+ec_w, y, z), (ec_w, 2.20, lc_h), collection, M_base)
    rounded_box("EC_CTop", (x+lc_w+0.80+ec_w-0.02, y-0.02, z+lc_h),
                (ec_w+0.04, 2.24, ctp_t), 0.01, collection, M_ctp)

    uc_bot, uc_h, uc_d = 1.65, 0.65, 0.35
    box("UC_Body", (x, y+lc_d-uc_d, uc_bot), (lc_w+0.80, uc_d, uc_h), collection, M_up)
    box("UC_GlDr", (x+lc_w/2, y+lc_d-uc_d-0.005, uc_bot+0.02),
        (lc_w/2-0.01, 0.01, uc_h-0.04), collection, M_gl)

    rx = x + lc_w + 0.80 + 0.05
    rounded_box("Fridge_Body", (rx, y, z), (0.68, 0.68, 1.85), 0.03, collection, M_appl)
    cylinder("Fridge_Hndl", (rx+0.06, y-0.04, z+1.50), 0.012, 0.55, 8, collection,
             mat_brushed_metal("FH2", (0.75, 0.75, 0.75)))

    box("Chim_Hood", (x+0.60, y+lc_d-0.35, z+lc_h+0.03), (0.80, 0.35, 0.35), collection, M_chim)
    box("Chim_Pipe", (x+0.90, y+lc_d-0.25, z+lc_h+0.38), (0.20, 0.15, 0.55), collection, M_chim)
    rounded_box("Hob", (x+0.15, y-0.01, z+lc_h+ctp_t), (0.80, 0.50, 0.03), 0.01, collection,
                mat_plain("Hob_B", (0.10, 0.10, 0.12), 0.10))
    for bx2, by2 in [(x+0.30,y+0.12),(x+0.65,y+0.12),(x+0.30,y+0.37),(x+0.65,y+0.37)]:
        cylinder(f"Burner_{bx2:.2f}", (bx2, by2, z+lc_h+ctp_t+0.03), 0.07, 0.02, 16, collection,
                 mat_brushed_metal("Brnr", (0.55, 0.55, 0.55)))
    rounded_box("Microwave", (x, y+lc_d-uc_d, uc_bot-0.42), (0.52, 0.34, 0.32), 0.02, collection, M_appl)


def make_bathroom(loc, size, is_master, collection):
    x, y, z = loc; bw, bd = size
    M_wc  = mat_plain("WC_Ceramic", (0.97, 0.97, 0.97), 0.10)
    M_chr = mat_plain("WC_Chrome",  (0.85, 0.85, 0.87), 0.08, metallic=0.9)
    M_cab = mat_plain("Bath_Cab",   (0.88, 0.86, 0.84), 0.25)
    M_mir = mat_glass("Bath_Mirror")
    rounded_box("WC_Pan",  (x+0.08, y+0.08, z),     (0.40, 0.60, 0.42), 0.05, collection, M_wc)
    rounded_box("WC_Tank", (x+0.08, y+0.48, z+0.42),(0.40, 0.18, 0.30), 0.02, collection, M_wc)
    rounded_box("WC_Seat", (x+0.07, y+0.07, z+0.42),(0.42, 0.36, 0.04), 0.04, collection,
                mat_plain("WCSeat", (0.96,0.96,0.96), 0.12))
    bx2 = x + (bw-0.55)/2
    rounded_box("Basin_Cab",  (bx2-0.02, y+0.75, z),     (0.59, 0.45, 0.85), 0.02, collection, M_cab)
    rounded_box("Basin_Bowl", (bx2,      y+0.76, z+0.82), (0.55, 0.42, 0.15), 0.05, collection, M_wc)
    cylinder("Basin_Drain",   (bx2+0.275, y+0.97, z+0.82), 0.025, 0.04, 12, collection, M_chr)
    cylinder("Tap_Basin",     (bx2+0.275, y+0.88, z+0.97), 0.015, 0.14,  8, collection, M_chr)
    mir_w = min(bw-0.20, 0.70)
    rounded_box("Bath_Mirror", (x+(bw-mir_w)/2, y+bd-0.045, z+0.90),
                (mir_w, 0.04, 0.60), 0.005, collection, M_mir)
    if is_master:
        sh_x, sh_y = x+0.02, y+1.50
        sh_w = min(bw-0.04, 0.90); sh_d = bd-1.52
        box("Shw_GlassFr", (sh_x, sh_y, z), (sh_w, 0.01, 2.10), collection, mat_glass())
        box("Shw_GlassR",  (sh_x+sh_w, sh_y, z), (0.01, sh_d, 2.10), collection, M_chr)
        cylinder("Shw_Arm",  (sh_x+sh_w/2, sh_y+sh_d/2, z+2.05), 0.015, 0.25,  8, collection, M_chr)
        cylinder("Shw_Head", (sh_x+sh_w/2, sh_y+sh_d/2, z+1.85), 0.08,  0.04, 16, collection, M_chr)
        rounded_box("Shw_Tray", (sh_x, sh_y, z-0.02), (sh_w, sh_d, 0.04), 0.01, collection,
                    mat_plain("ShwTray", (0.92,0.92,0.92), 0.08))
    else:
        rounded_box("Tub", (x+0.02, y+1.30, z), (bw-0.04, bd-1.32, 0.55), 0.04, collection, M_wc)
        cylinder("CB_ShwH", (x+bw/2, y+bd-0.20, z+1.90), 0.07, 0.03, 16, collection, M_chr)


# ── Windows, doors ────────────────────────────────────────────────────────────

def window_frame(name, x, y, z, w, h, angle, collection):
    M_fr = mat_plain("Win_Frame", (0.94, 0.92, 0.90), 0.40)
    M_gl = mat_glass(); ft = 0.055
    def seg(sfx, lx,ly,lz, slx,sly,slz):
        b = box(name+sfx, (lx,ly,lz), (slx,sly,slz), collection, M_fr); b.rotation_euler[2] = angle
    def gl_p(sfx, lx,ly,lz, slx,sly,slz):
        b = box(name+sfx, (lx,ly,lz), (slx,sly,slz), collection, M_gl); b.rotation_euler[2] = angle
    seg("_fL",x,y,z,ft,WT,h);          seg("_fR",x+w-ft,y,z,ft,WT,h)
    seg("_fT",x,y,z+h-ft,w,WT,ft);     seg("_fB",x,y,z,w,WT,ft)
    gl_p("_gl",x+ft,y+ft,z+ft,w-2*ft,WT-2*ft,h-2*ft)
    seg("_sill",x-0.04,y-0.04,z-ft,w+0.08,WT+0.08,ft)


def door_frame(name, x, y, z, w, h, angle, collection, mat_leaf=None):
    M_fr  = mat_plain("Door_Frame", (0.92, 0.90, 0.87), 0.45)
    M_lf  = mat_leaf or mat_plain("Door_Leaf", (0.68, 0.52, 0.35), 0.55)
    M_hnd = mat_brushed_metal("DoorHnd", (0.72, 0.72, 0.70)); ft = 0.06
    def seg(sfx, lx,ly,lz, slx,sly,slz):
        b = box(name+sfx, (lx,ly,lz), (slx,sly,slz), collection, M_fr); b.rotation_euler[2] = angle
    seg("_fL",x-ft,y,z,ft,WT+ft,h+ft); seg("_fR",x+w,y,z,ft,WT+ft,h+ft)
    seg("_fT",x-ft,y,z+h,w+2*ft,WT+ft,ft)
    leaf = box(name+"_leaf",(x,y+0.02,z),(w,0.04,h),collection,M_lf)
    leaf.rotation_euler[2] = angle + math.radians(15)
    cylinder(name+"_hnd",(x+w-0.10,y,z+h*0.50),0.012,0.12,8,collection,M_hnd)
    box(name+"_pan",(x+0.08,y+0.02,z+0.10),(w-0.16,0.02,h-0.20),collection,
        mat_plain("DoorPanel",(0.72,0.56,0.38),0.55))


def skirting(name, x1, y1, x2, y2, collection, h=0.10, t=0.015):
    M = mat_plain("Skirting", (0.96, 0.95, 0.93), 0.50)
    length = math.hypot(x2-x1, y2-y1); angle = math.atan2(y2-y1, x2-x1)
    b = box(name, (0,0,0), (length,t,h), collection, M)
    b.rotation_euler[2] = angle; b.location = (x1, y1, 0)


def false_ceiling_cove(name, x, y, lx, ly, drop, collection):
    M_ceil = mat_plain("FCeil",    (0.97, 0.97, 0.96), 0.85)
    M_led  = mat_plain("LED_Cove", (1.00, 0.95, 0.80), 0.0, emission=(1.00, 0.95, 0.80))
    cove_w = 0.30; z_drop = WH - drop
    for sn, sx, sy, sw, sd in [
        (name+"_N", x,           y+ly-cove_w, lx,          cove_w),
        (name+"_S", x,           y,            lx,          cove_w),
        (name+"_W", x,           y+cove_w,     cove_w,      ly-2*cove_w),
        (name+"_E", x+lx-cove_w, y+cove_w,     cove_w,      ly-2*cove_w),
    ]: box(sn, (sx, sy, z_drop), (sw, sd, drop), collection, M_ceil)
    box(name+"_Inner",(x+cove_w,y+cove_w,z_drop-0.01),
        (lx-2*cove_w,ly-2*cove_w,0.015),collection,
        mat_plain("FCeilTray",(0.96,0.95,0.94),0.85))
    led_t = 0.015
    for sn, sx, sy, sw, sd in [
        (name+"_LN", x+cove_w,           y+ly-cove_w-led_t, lx-2*cove_w, led_t),
        (name+"_LS", x+cove_w,           y+cove_w,           lx-2*cove_w, led_t),
        (name+"_LW", x+cove_w,           y+cove_w+led_t,     led_t, ly-2*cove_w-2*led_t),
        (name+"_LE", x+lx-cove_w-led_t,  y+cove_w+led_t,    led_t, ly-2*cove_w-2*led_t),
    ]: box(sn, (sx, sy, z_drop), (sw, sd, 0.02), collection, M_led)


def ceiling_light(name, x, y, collection):
    M_ring = mat_plain("DL_Ring", (0.85, 0.85, 0.85), 0.20, metallic=0.5)
    cylinder(name+"_ring", (x, y, WH-0.02), 0.055, 0.025, 16, collection, M_ring)
    bpy.ops.object.light_add(type="POINT", location=(x, y, WH-0.08))
    lt = bpy.context.active_object; lt.name = name+"_lt"
    lt.data.energy = 18; lt.data.color = (1.00, 0.90, 0.75); lt.data.shadow_soft_size = 0.05
    collection.objects.link(lt); bpy.context.scene.collection.objects.unlink(lt)


def bedside_lamp(name, loc, collection):
    """Procedural lamp — no suitable CC0 lamp asset available on PH."""
    M_b = mat_brushed_metal(); M_s = mat_plain("LShade", (0.95, 0.88, 0.75), 0.85)
    x, y, z = loc
    cylinder(name+"_base",  (x, y, z),      0.05,  0.28, 12, collection, M_b)
    cylinder(name+"_shade", (x, y, z+0.26), 0.18,  0.22, 16, collection, M_s)
    bpy.ops.object.light_add(type="POINT", location=(x, y, z+0.34))
    lt = bpy.context.active_object; lt.name = name+"_pt"
    lt.data.energy = 12; lt.data.color = (1.00, 0.88, 0.70); lt.data.shadow_soft_size = 0.10
    collection.objects.link(lt)
    try: bpy.context.scene.collection.objects.unlink(lt)
    except: pass


def add_camera(name, loc, target, collection, lens=28):
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.active_object; cam.name = name
    cam.data.lens = lens; cam.data.clip_start = 0.1; cam.data.clip_end = 50
    dx,dy,dz = target[0]-loc[0], target[1]-loc[1], target[2]-loc[2]
    pitch = math.atan2(-dz, math.hypot(dx, dy)); yaw = math.atan2(dy, dx) - math.pi/2
    cam.rotation_euler = (math.pi/2+pitch, 0, yaw)
    collection.objects.link(cam)
    try: bpy.context.scene.collection.objects.unlink(cam)
    except: pass
    return cam


# ══════════════════════════════════════════════════════════════════════════════
# MAIN BUILD
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "="*62)
print("NR Constructions — Building apartment (CC0 furniture edition)")
print("Assets download on first run and are cached to:", PH_CACHE)
print("="*62 + "\n")

clear_scene()

C_struct = coll("Structure")
C_floors = coll("Floors")
C_ceil   = coll("Ceilings")
C_open   = coll("Openings")
C_kit    = coll("Kitchen")
C_living = coll("Living")
C_dining = coll("Dining")
C_mbr    = coll("Master_BR")
C_br2    = coll("Bedroom2")
C_bath   = coll("Bathrooms")
C_bal    = coll("Balcony")
C_lights = coll("Lights")
C_cam    = coll("Cameras")

# ── Materials ─────────────────────────────────────────────────────────────────
M_wall  = mat_plain("Wall_Paint", (0.96, 0.95, 0.93), roughness=0.90)
M_slab  = mat_plain("Slab",       (0.82, 0.80, 0.78), roughness=0.70)

# ── Floor slab ────────────────────────────────────────────────────────────────
box("Slab", (-WT,-WT,-FH), (9.4+2*WT, 8.5+2*WT, FH), C_struct, M_slab)

# ── Room floors ───────────────────────────────────────────────────────────────
box("Fl_Foyer",   (0,   0,   0), (1.5, 1.8, 0.02), C_floors, mat_marble())
box("Fl_Living",  (1.5, 0,   0), (5.3, 4.2, 0.02), C_floors, mat_marble())
box("Fl_Kitchen", (6.8, 0,   0), (2.6, 3.0, 0.02), C_floors, mat_tile("Kitchen_Tile",(0.88,0.86,0.84),(0.55,0.55,0.55),0.30))
box("Fl_Balcony", (6.8, 3.0, 0), (2.6, 1.2, 0.02), C_floors, mat_tile("Outdoor_Tile",(0.70,0.68,0.65),(0.48,0.48,0.48),0.40))
box("Fl_MBR",     (0,   4.2, 0), (4.2, 4.3, 0.02), C_floors, mat_wood("BR_Wood",(0.45,0.30,0.16)))
box("Fl_MBath",   (0,   7.0, 0), (2.0, 1.5, 0.02), C_floors, mat_tile("Bath_Tile",(0.92,0.92,0.92),(0.50,0.50,0.50),0.25))
box("Fl_BR2",     (4.2, 4.2, 0), (3.8, 4.3, 0.02), C_floors, mat_wood("BR_Wood"))
box("Fl_CBath",   (8.0, 4.2, 0), (1.4, 3.0, 0.02), C_floors, mat_tile("Bath_Tile"))

# ── Main ceiling ──────────────────────────────────────────────────────────────
box("Ceil_Main", (-WT,-WT,WH), (9.4+2*WT, 8.5+2*WT, 0.12), C_ceil,
    mat_plain("Ceiling", (0.98,0.98,0.97), roughness=0.90))

# ── False ceilings ────────────────────────────────────────────────────────────
false_ceiling_cove("FC_Living", 1.5, 0.0, 5.3, 4.2, 0.18, C_ceil)
false_ceiling_cove("FC_MBR",    0.0, 4.2, 4.2, 4.3, 0.15, C_ceil)
false_ceiling_cove("FC_BR2",    4.2, 4.2, 3.8, 4.3, 0.15, C_ceil)

# ── Exterior walls ────────────────────────────────────────────────────────────
wall_with_openings("EW_South", -WT,-WT, 9.4+WT,-WT,
    [(0.50,DW,0,DH),(2.10,WW,WSH,WSH+WWH),(3.70,WW,WSH,WSH+WWH),(7.10,WW,WSH,WSH+WWH)],
    C_struct, material=M_wall)
wall_with_openings("EW_North", -WT,8.5+WT, 9.4+WT,8.5+WT,
    [(0.90,WW,WSH,WSH+WWH),(5.00,WW,WSH,WSH+WWH)], C_struct, material=M_wall)
wall_with_openings("EW_West",  -WT,-WT, -WT,8.5+WT,
    [(5.40,WW,WSH,WSH+WWH)], C_struct, material=M_wall)
wall_with_openings("EW_East",  9.4+WT,-WT, 9.4+WT,8.5+WT,
    [(0.50,WW,WSH,WSH+WWH),(4.50,0.60,1.60,2.20)], C_struct, material=M_wall)

# ── Interior walls ────────────────────────────────────────────────────────────
wall_with_openings("IW_Foyer_E",1.5,0,   1.5,1.8, [(0.0,1.5,0,DH)],           C_struct,material=M_wall)
wall_with_openings("IW_LivKit", 6.8,0,   6.8,4.2, [(0.60,1.20,0.85,2.10)],    C_struct,material=M_wall)
wall_with_openings("IW_MidH",   0,  4.2, 9.4,4.2, [(1.50,DW,0,DH),(4.60,DW,0,DH)],C_struct,material=M_wall)
wall_with_openings("IW_BR_Div", 4.2,4.2, 4.2,8.5, [],                          C_struct,material=M_wall)
wall_with_openings("IW_MBath_S",0,  7.0, 2.0,7.0, [(0.20,DW,0,DH)],           C_struct,material=M_wall)
wall_with_openings("IW_MBath_E",2.0,7.0, 2.0,8.5, [],                          C_struct,material=M_wall)
wall_with_openings("IW_CBath_W",8.0,4.2, 8.0,7.2, [(0.40,DW,0,DH)],           C_struct,material=M_wall)
wall_with_openings("IW_CBath_N",8.0,7.2, 9.4,7.2, [],                          C_struct,material=M_wall)
wall_with_openings("IW_Balcony",6.8,3.0, 9.4,3.0, [(0.30,1.60,0,SDH)],        C_struct,material=M_wall)

# ── Skirting ──────────────────────────────────────────────────────────────────
for seg in [
    ("Sk_Liv_S",1.5,0,  6.8,0), ("Sk_Liv_N",1.5,4.2,6.8,4.2),
    ("Sk_Liv_W",0,0,    0,4.2), ("Sk_Kit_W",6.8,0,  6.8,3.0),
    ("Sk_MBR_S",0,4.2, 4.2,4.2),("Sk_MBR_N",0,8.5, 4.2,8.5),
    ("Sk_MBR_W",0,4.2,  0,7.0), ("Sk_BR2_S",4.2,4.2,8.0,4.2),
    ("Sk_BR2_N",4.2,8.5,8.0,8.5),("Sk_BR2_E",8.0,4.2,8.0,7.2),
]: skirting(*seg, C_struct)

# ── Windows & doors ───────────────────────────────────────────────────────────
window_frame("Win_Liv1", 2.10,-WT-0.01,  WSH,WW,WWH,0,         C_open)
window_frame("Win_Liv2", 3.70,-WT-0.01,  WSH,WW,WWH,0,         C_open)
window_frame("Win_Kit_S",7.10,-WT-0.01,  WSH,WW,WWH,0,         C_open)
window_frame("Win_MBR_N",0.90,8.5+WT+0.01,WSH,WW,WWH,math.pi,  C_open)
window_frame("Win_BR2_N",5.00,8.5+WT+0.01,WSH,WW,WWH,math.pi,  C_open)
window_frame("Win_MBR_W",-WT-0.01,4.2+5.40,WSH,WW,WWH,-math.pi/2,C_open)
window_frame("Win_Kit_E",9.4+WT+0.01,0.50,WSH,WW,WWH,math.pi/2,C_open)
window_frame("Win_CBath",9.4+WT+0.01,4.50,1.60,0.60,0.60,math.pi/2,C_open)

door_frame("Dr_Entry", 0.50,-WT, 0,DW,DH,0,         C_open)
door_frame("Dr_MBR",   1.50,4.2, 0,DW,DH,0,         C_open)
door_frame("Dr_BR2",   4.60,4.2, 0,DW,DH,0,         C_open)
door_frame("Dr_MBath", 0.20,7.0, 0,DW,DH,0,         C_open)
door_frame("Dr_CBath", 8.0, 4.60,0,DW,DH,math.pi/2, C_open)

# ── Balcony railing ───────────────────────────────────────────────────────────
M_glass = mat_glass(); M_rail = mat_brushed_metal("Railing")
box("Bal_Rail_Glass",(6.8,2.95,0),(2.6,0.04,1.05),C_struct,M_glass)
rounded_box("Bal_Handrail",(6.75,2.92,1.05),(2.65,0.08,0.04),0.01,C_struct,M_rail)
for pi2 in range(5):
    cylinder(f"Bal_Post{pi2}",(6.8+pi2*0.60,2.97,0),0.025,1.09,8,C_struct,M_rail)

# ══════════════════════════════════════════════════════════════════════════════
# CC0 FURNITURE  —  Poly Haven  (https://polyhaven.com/models, CC0 licence)
# ══════════════════════════════════════════════════════════════════════════════
print("── Downloading & placing CC0 furniture ──\n")

# ┌────────────────────────────────────────────────────────────────────────┐
# │  LIVING ROOM   x=1.5→6.8  y=0→4.2                                    │
# └────────────────────────────────────────────────────────────────────────┘

# Sofa_01 — modern 3-seat straight sofa (https://polyhaven.com/a/Sofa_01)
place_ph_asset("Sofa_01", C_living,
    loc=(2.65, 0.55, 0), rot_z=0, target_width=2.20, prefix="Sofa")

# ArmChair_01 — upholstered armchair (https://polyhaven.com/a/ArmChair_01)
place_ph_asset("ArmChair_01", C_living,
    loc=(5.55, 0.65, 0), rot_z=math.pi+math.radians(20),
    target_width=0.85, prefix="Armchair")

# Ottoman_01 — fabric ottoman/footstool (https://polyhaven.com/a/Ottoman_01)
place_ph_asset("Ottoman_01", C_living,
    loc=(2.90, 1.55, 0), rot_z=0, target_width=0.70, prefix="Ottoman")

# coffee_table_round_01 — glass + metal round table
# (https://polyhaven.com/a/coffee_table_round_01)
place_ph_asset("coffee_table_round_01", C_living,
    loc=(3.55, 1.85, 0), rot_z=0, target_width=1.00, prefix="CoffeeTbl")

# ClassicConsole_01 — low sideboard (used as TV unit)
# (https://polyhaven.com/a/ClassicConsole_01)
place_ph_asset("ClassicConsole_01", C_living,
    loc=(3.20, 3.76, 0), rot_z=math.pi, target_width=1.80, prefix="TVUnit")

# Television_01 — flat-screen TV (https://polyhaven.com/a/Television_01)
# Placed on top of the console (~0.52 m off floor)
place_ph_asset("Television_01", C_living,
    loc=(3.20, 3.74, 0.52), rot_z=math.pi, target_width=1.40, prefix="TV")

# Carpet — procedural (flat plane; no CC0 rug available)
rounded_box("Carpet_Living", (1.72,0.42,0.005), (3.20,2.55,0.008), 0.02, C_living,
            mat_plain("Carpet_Mat", (0.52,0.40,0.30), roughness=0.98))

# calathea_orbifolia_01 — large-leaf tropical plant
# (https://polyhaven.com/a/calathea_orbifolia_01)
place_ph_asset("calathea_orbifolia_01", C_living,
    loc=(1.65, 3.62, 0), rot_z=0, target_width=0.50, prefix="Plant_Liv1")

# anthurium_botany_01 — anthurium plant
# (https://polyhaven.com/a/anthurium_botany_01)
place_ph_asset("anthurium_botany_01", C_living,
    loc=(6.55, 0.48, 0), rot_z=math.radians(30), target_width=0.45, prefix="Plant_Liv2")

# ┌────────────────────────────────────────────────────────────────────────┐
# │  DINING AREA   x≈4.4→6.4  y≈0.1→1.6                                  │
# └────────────────────────────────────────────────────────────────────────┘

# WoodenTable_02 — solid rectangular dining table
# (https://polyhaven.com/a/WoodenTable_02)
place_ph_asset("WoodenTable_02", C_dining,
    loc=(5.00, 0.65, 0), rot_z=0, target_width=1.60, prefix="DiningTable")

# WoodenChair_01 — classic wooden chair × 6
# (https://polyhaven.com/a/WoodenChair_01)
# 2 at short ends, 4 along long sides
_chair_positions = [
    (4.42, 0.85, -math.pi/2),    # left end, facing right
    (6.68, 0.85,  math.pi/2),    # right end, facing left
    (4.82, 0.10,  math.pi),      # front-left
    (5.60, 0.10,  math.pi),      # front-right
    (4.82, 1.55,  0.0),          # back-left
    (5.60, 1.55,  0.0),          # back-right
]
for i, (cx, cy, crot) in enumerate(_chair_positions):
    place_ph_asset("WoodenChair_01", C_dining,
        loc=(cx, cy, 0), rot_z=crot, target_width=0.48, prefix=f"DChair{i}")

# ┌────────────────────────────────────────────────────────────────────────┐
# │  KITCHEN   x=6.8→9.4  y=0→3.0  — procedural (no CC0 kitchen assets)  │
# └────────────────────────────────────────────────────────────────────────┘
print("  Building kitchen fixtures (procedural)…")
make_kitchen((7.0, 0.23, 0), C_kit)

# ┌────────────────────────────────────────────────────────────────────────┐
# │  MASTER BEDROOM   x=0→4.2  y=4.2→8.5                                  │
# └────────────────────────────────────────────────────────────────────────┘

# GothicBed_01 — ornate double bed (only CC0 bed on Poly Haven)
# (https://polyhaven.com/a/GothicBed_01)
# Scaled to king size (1.85 m wide). Headboard typically faces +Y.
place_ph_asset("GothicBed_01", C_mbr,
    loc=(1.15, 6.00, 0), rot_z=0, target_width=1.85, prefix="KingBed")

# ClassicNightstand_01 — classic wooden nightstand × 2
# (https://polyhaven.com/a/ClassicNightstand_01)
place_ph_asset("ClassicNightstand_01", C_mbr,
    loc=(0.05, 6.20, 0), rot_z= math.pi/2, target_width=0.50, prefix="NstandL")
place_ph_asset("ClassicNightstand_01", C_mbr,
    loc=(2.20, 6.20, 0), rot_z=-math.pi/2, target_width=0.50, prefix="NstandR")

# Bedside lamps (procedural — no CC0 table lamp on PH)
bedside_lamp("Lamp_MBR_L", (0.30, 6.45, 0.52), C_lights)
bedside_lamp("Lamp_MBR_R", (2.45, 6.45, 0.52), C_lights)

# GothicCabinet_01 — tall ornate cabinet (used as wardrobe) × 2
# (https://polyhaven.com/a/GothicCabinet_01)
place_ph_asset("GothicCabinet_01", C_mbr,
    loc=(2.10, 4.30, 0), rot_z=math.pi, target_width=0.90, prefix="Ward_MBR_A")
place_ph_asset("GothicCabinet_01", C_mbr,
    loc=(3.05, 4.30, 0), rot_z=math.pi, target_width=0.90, prefix="Ward_MBR_B")

# Curtains — procedural panels (PH has no curtain asset)
M_curt = mat_plain("Curtain_MBR", (0.88, 0.82, 0.75), 0.92)
box("Curt_MBR_L", (-WT, 8.22, 0), (0.30, 0.08, 2.50), C_mbr, M_curt)
box("Curt_MBR_R", (-WT, 8.70, 0), (0.30, 0.08, 2.50), C_mbr, M_curt)

# ┌────────────────────────────────────────────────────────────────────────┐
# │  MASTER BATHROOM   x=0→2.0  y=7.0→8.5  — procedural fixtures         │
# └────────────────────────────────────────────────────────────────────────┘
print("  Building master bathroom (procedural)…")
make_bathroom((0.08, 7.08, 0), (1.84, 1.42), is_master=True,  collection=C_bath)

# ┌────────────────────────────────────────────────────────────────────────┐
# │  BEDROOM 2   x=4.2→8.0  y=4.2→8.5                                    │
# └────────────────────────────────────────────────────────────────────────┘

# GothicBed_01 scaled to queen size (1.60 m wide)
place_ph_asset("GothicBed_01", C_br2,
    loc=(5.80, 6.20, 0), rot_z=0, target_width=1.60, prefix="QueenBed")

place_ph_asset("ClassicNightstand_01", C_br2,
    loc=(7.35, 6.38, 0), rot_z=-math.pi/2, target_width=0.45, prefix="NstandBR2")

bedside_lamp("Lamp_BR2", (7.58, 6.60, 0.50), C_lights)

# Wardrobe — along south wall of BR2
place_ph_asset("GothicCabinet_01", C_br2,
    loc=(4.30, 4.85, 0), rot_z=math.pi/2, target_width=0.90, prefix="Ward_BR2")

# SchoolDesk_01 — wooden desk (https://polyhaven.com/a/SchoolDesk_01)
place_ph_asset("SchoolDesk_01", C_br2,
    loc=(6.40, 4.42, 0), rot_z=0, target_width=1.20, prefix="Desk_BR2")

# SchoolChair_01 — wooden chair (https://polyhaven.com/a/SchoolChair_01)
place_ph_asset("SchoolChair_01", C_br2,
    loc=(6.82, 5.22, 0), rot_z=math.pi, target_width=0.46, prefix="DeskChair")

M_curt2 = mat_plain("Curtain_BR2", (0.80, 0.85, 0.90), 0.92)
box("Curt_BR2_L", (4.82, 8.50, 0), (0.08, 0.30, 2.50), C_br2, M_curt2)
box("Curt_BR2_R", (5.40, 8.50, 0), (0.08, 0.30, 2.50), C_br2, M_curt2)

# ┌────────────────────────────────────────────────────────────────────────┐
# │  COMMON BATHROOM   x=8.0→9.4  y=4.2→7.2  — procedural fixtures       │
# └────────────────────────────────────────────────────────────────────────┘
print("  Building common bathroom (procedural)…")
make_bathroom((8.08, 4.28, 0), (1.32, 2.90), is_master=False, collection=C_bath)

# ┌────────────────────────────────────────────────────────────────────────┐
# │  BALCONY   x=6.8→9.4  y=3.0→4.2                                      │
# └────────────────────────────────────────────────────────────────────────┘

# bar_chair_round_01 — modern round-base bar/counter chair × 2
# (https://polyhaven.com/a/bar_chair_round_01)
place_ph_asset("bar_chair_round_01", C_bal,
    loc=(7.40, 3.40, 0), rot_z=math.radians( 30), target_width=0.50, prefix="BalChair1")
place_ph_asset("bar_chair_round_01", C_bal,
    loc=(8.50, 3.40, 0), rot_z=math.radians(-20), target_width=0.50, prefix="BalChair2")

# WoodenTable_01 — small outdoor table
# (https://polyhaven.com/a/WoodenTable_01)
place_ph_asset("WoodenTable_01", C_bal,
    loc=(7.95, 3.58, 0), rot_z=0, target_width=0.75, prefix="BalTable")

# calathea_orbifolia_01 — balcony plant
place_ph_asset("calathea_orbifolia_01", C_bal,
    loc=(6.90, 3.12, 0), rot_z=math.radians(15), target_width=0.45, prefix="BalPlant")

# ══════════════════════════════════════════════════════════════════════════════
# CEILING DOWNLIGHTS
# ══════════════════════════════════════════════════════════════════════════════
for lname, lx, ly in [
    ("DL_Foyer",  0.75, 0.90),
    ("DL_Liv1",   3.00, 1.50), ("DL_Liv2",  5.00, 1.50),
    ("DL_Liv3",   3.00, 3.00), ("DL_Liv4",  5.00, 3.00),
    ("DL_Kit1",   7.60, 1.20), ("DL_Kit2",  8.80, 1.20),
    ("DL_MBR1",   1.50, 5.50), ("DL_MBR2",  3.00, 6.50),
    ("DL_BR2_1",  5.50, 5.80), ("DL_BR2_2", 7.00, 6.50),
    ("DL_MBath",  0.90, 7.80),
    ("DL_CBath",  8.60, 5.60),
    ("DL_Bal",    8.00, 3.45),
]:
    ceiling_light(lname, lx, ly, C_lights)

# ══════════════════════════════════════════════════════════════════════════════
# SCENE LIGHTING
# ══════════════════════════════════════════════════════════════════════════════
print("\n── Setting up lighting ──")

bpy.ops.object.light_add(type="SUN", location=(10, -5, 12))
sun = bpy.context.active_object; sun.name = "Sun_Main"
sun.data.energy = 2.5; sun.data.color = (1.00, 0.95, 0.85)
sun.data.angle  = math.radians(5)
sun.rotation_euler = (math.radians(55), 0, math.radians(-35))
C_lights.objects.link(sun); bpy.context.scene.collection.objects.unlink(sun)

bpy.ops.object.light_add(type="AREA", location=(4.7, 12, 3))
fill = bpy.context.active_object; fill.name = "Fill_North"
fill.data.energy = 80; fill.data.color = (0.85, 0.90, 1.00); fill.data.size = 6.0
fill.rotation_euler = (math.radians(15), 0, 0)
C_lights.objects.link(fill); bpy.context.scene.collection.objects.unlink(fill)

for wname, wx, wy, wz, wrot in [
    ("WAL_S1", 2.70, -1.5, 1.50, (math.pi/2, 0, 0)),
    ("WAL_S2", 4.30, -1.5, 1.50, (math.pi/2, 0, 0)),
    ("WAL_W1",-1.5,  6.50, 1.50, (math.pi/2, 0, math.pi/2)),
]:
    bpy.ops.object.light_add(type="AREA", location=(wx, wy, wz))
    wl = bpy.context.active_object; wl.name = wname
    wl.data.energy = 120; wl.data.color = (0.90, 0.93, 1.00); wl.data.size = 1.0
    wl.rotation_euler = wrot
    C_lights.objects.link(wl); bpy.context.scene.collection.objects.unlink(wl)

world = bpy.context.scene.world; world.use_nodes = True
wnt = world.node_tree; wnt.nodes.clear()
bg  = wnt.nodes.new("ShaderNodeBackground")
sky = wnt.nodes.new("ShaderNodeTexSky")
out = wnt.nodes.new("ShaderNodeOutputWorld")
_np(sky, "sky_type",  "PREETHAM")
_np(sky, "turbidity", 2.0)
_si(bg, "Strength", 0.6)
wnt.links.new(sky.outputs[0],  _inp(bg,  "Color"))
wnt.links.new(bg.outputs[0],   _inp(out, "Surface"))

# ══════════════════════════════════════════════════════════════════════════════
# CAMERAS
# ══════════════════════════════════════════════════════════════════════════════
print("── Placing cameras ──")

cam_living = add_camera("Cam_Living",  (1.8,1.2,1.6),  (4.5,2.5,1.2), C_cam, lens=24)
add_camera("Cam_Kitchen", (6.9,2.5,1.6), (8.5,1.0,1.2), C_cam, lens=28)
add_camera("Cam_MBR",     (3.5,5.0,1.6), (0.9,6.5,1.0), C_cam, lens=28)
add_camera("Cam_BR2",     (7.8,5.2,1.6), (5.5,6.5,1.0), C_cam, lens=28)
add_camera("Cam_Balcony", (7.5,3.4,1.5), (8.0,3.1,1.0), C_cam, lens=28)
add_camera("Cam_TopView", (4.7,4.25,14), (4.7,4.25,0),  C_cam, lens=50)
bpy.context.scene.camera = cam_living

# ── Fly-through animation ─────────────────────────────────────────────────────
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end   = 210
bpy.context.scene.render.fps  = 30

bpy.ops.object.camera_add(location=(0.8, 0.8, 1.6))
fly_cam = bpy.context.active_object; fly_cam.name = "Cam_FlyThrough"
C_cam.objects.link(fly_cam)
try: bpy.context.scene.collection.objects.unlink(fly_cam)
except: pass
fly_cam.data.lens = 28

for frame, pos, tgt in [
    (1,   (0.80,0.80,1.6),(4.5,2.5,1.2)),
    (40,  (3.00,1.50,1.6),(4.5,2.0,1.0)),
    (70,  (6.50,2.50,1.6),(8.5,1.0,1.2)),
    (100, (0.50,6.50,1.6),(2.0,7.0,1.0)),
    (130, (3.50,5.00,1.6),(0.9,6.5,1.0)),
    (160, (7.50,5.50,1.6),(5.5,6.5,1.0)),
    (190, (7.80,3.40,1.5),(8.0,3.1,1.0)),
    (210, (0.80,0.80,1.6),(4.5,2.5,1.2)),
]:
    bpy.context.scene.frame_set(frame)
    fly_cam.location = pos
    dx,dy,dz = tgt[0]-pos[0], tgt[1]-pos[1], tgt[2]-pos[2]
    pitch = math.atan2(-dz, math.hypot(dx, dy)); yaw = math.atan2(dy, dx) - math.pi/2
    fly_cam.rotation_euler = (math.pi/2+pitch, 0, yaw)
    fly_cam.keyframe_insert("location"); fly_cam.keyframe_insert("rotation_euler")

for fc in fly_cam.animation_data.action.fcurves:
    for kf in fc.keyframe_points: kf.interpolation = "BEZIER"

# ══════════════════════════════════════════════════════════════════════════════
# RENDER SETTINGS + GLB EXPORT
# ══════════════════════════════════════════════════════════════════════════════
scene = bpy.context.scene
scene.render.engine        = "CYCLES"
scene.cycles.samples       = 128
scene.cycles.use_denoising = True
scene.render.resolution_x  = 1920
scene.render.resolution_y  = 1080
scene.cycles.device        = "GPU"

import os
out_path = os.path.join(
    os.path.dirname(bpy.data.filepath) if bpy.data.filepath else os.path.expanduser("~"),
    "apartment.glb",
)
bpy.ops.export_scene.gltf(
    filepath         = out_path,
    export_format    = "GLB",
    export_apply     = True,
    export_draco_mesh_compression_enable = True,
    export_draco_mesh_compression_level  = 6,
    export_image_format = "WEBP",
    export_cameras   = True,
    export_lights    = True,
    export_animations= True,
)

print("\n" + "="*62)
print(f"✓  Export complete: {out_path}")
print(f"   Copy to: public/assets/3d/apartment.glb")
print()
print("CC0 assets used — all Poly Haven (polyhaven.com/models):")
assets = [
    "Sofa_01", "ArmChair_01", "Ottoman_01", "coffee_table_round_01",
    "ClassicConsole_01", "Television_01", "calathea_orbifolia_01",
    "anthurium_botany_01", "WoodenTable_01", "WoodenTable_02",
    "WoodenChair_01 ×6", "GothicBed_01 ×2", "ClassicNightstand_01 ×3",
    "GothicCabinet_01 ×3", "SchoolDesk_01", "SchoolChair_01",
    "bar_chair_round_01 ×2",
]
for a in assets: print(f"  • {a}")
print("="*62 + "\n")
