"""
Roshan Apartments — Production 3D Model
NR Constructions, Corlim, North Goa

Run from Blender 3.6+ Scripting workspace.
After running: File → Export → glTF 2.0 (.glb)
  ✓ Apply Modifiers
  ✓ Draco compression
  Format: Binary (.glb)

Unit: Left apartment from typical floor plan
Area: 102 sqm carpet area
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix

# ══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ══════════════════════════════════════════════════════════════════════════════
WH   = 2.85    # Wall height
WT   = 0.23    # Wall thickness (9-inch brick)
FH   = 0.12    # Floor slab thickness
DH   = 2.10    # Door height
SDH  = 2.40    # Sliding door height
DW   = 0.90    # Door width
WW   = 1.20    # Window width
WWH  = 1.20    # Window height
WSH  = 0.90    # Window sill height

# ══════════════════════════════════════════════════════════════════════════════
# UTILITIES
# ══════════════════════════════════════════════════════════════════════════════

MAT = {}

def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for m in bpy.data.meshes:
        bpy.data.meshes.remove(m)
    for m in bpy.data.materials:
        bpy.data.materials.remove(m)

def coll(name, parent=None):
    c = bpy.data.collections.new(name)
    (parent or bpy.context.scene.collection).children.link(c)
    return c

def link(obj, collection):
    collection.objects.link(obj)
    return obj

def set_smooth(obj, angle=30):
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()
    obj.data.use_auto_smooth = True
    obj.data.auto_smooth_angle = math.radians(angle)

def add_bevel(obj, width=0.015, segs=2):
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segs
    mod.limit_method = "ANGLE"
    mod.angle_limit = math.radians(60)

def add_subsurf(obj, levels=2):
    mod = obj.modifiers.new("SubSurf", "SUBSURF")
    mod.levels = levels
    mod.render_levels = levels

# ── Material builder ─────────────────────────────────────────────────────────

def mat_plain(name, color, roughness=0.7, metallic=0.0, alpha=1.0,
              emission=None, ior=1.45, transmission=0.0):
    if name in MAT:
        return MAT[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out  = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    bsdf.inputs["Base Color"].default_value  = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value   = roughness
    bsdf.inputs["Metallic"].default_value    = metallic
    bsdf.inputs["IOR"].default_value         = ior
    if transmission > 0:
        bsdf.inputs["Transmission Weight"].default_value = transmission
        m.blend_method  = "BLEND"
        m.shadow_method = "NONE"
    if emission:
        bsdf.inputs["Emission Color"].default_value    = (*emission, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 2.0
    if alpha < 1.0:
        m.blend_method  = "BLEND"
        bsdf.inputs["Alpha"].default_value = alpha
    MAT[name] = m
    return m

def mat_marble(name="Marble_Floor"):
    if name in MAT: return MAT[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out   = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf  = nt.nodes.new("ShaderNodeBsdfPrincipled")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    wave  = nt.nodes.new("ShaderNodeTexWave")
    ramp  = nt.nodes.new("ShaderNodeValToRGB")
    mix   = nt.nodes.new("ShaderNodeMixRGB")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    scale = nt.nodes.new("ShaderNodeMapping")
    noise.inputs["Scale"].default_value     = 6.0
    noise.inputs["Detail"].default_value    = 12.0
    noise.inputs["Roughness"].default_value = 0.6
    wave.inputs["Scale"].default_value      = 3.0
    wave.inputs["Distortion"].default_value = 2.0
    ramp.color_ramp.elements[0].color  = (0.9, 0.88, 0.85, 1)
    ramp.color_ramp.elements[1].color  = (0.78, 0.75, 0.72, 1)
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[1].position = 1.0
    mix.blend_type = "MULTIPLY"
    mix.inputs["Fac"].default_value = 0.4
    nt.links.new(coord.outputs["Generated"], scale.inputs["Vector"])
    nt.links.new(scale.outputs["Vector"],    noise.inputs["Vector"])
    nt.links.new(scale.outputs["Vector"],    wave.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"],       ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"],      mix.inputs["Color1"])
    nt.links.new(wave.outputs["Color"],      mix.inputs["Color2"])
    nt.links.new(mix.outputs["Color"],       bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value  = 0.08
    bsdf.inputs["Specular IOR Level"].default_value = 0.9
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    MAT[name] = m
    return m

def mat_wood(name="Wood_Floor", color=(0.42, 0.28, 0.14)):
    if name in MAT: return MAT[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out   = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf  = nt.nodes.new("ShaderNodeBsdfPrincipled")
    wave  = nt.nodes.new("ShaderNodeTexWave")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    bump  = nt.nodes.new("ShaderNodeBump")
    ramp  = nt.nodes.new("ShaderNodeValToRGB")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    scale = nt.nodes.new("ShaderNodeMapping")
    scale.inputs["Scale"].default_value = (8, 1, 1)
    wave.wave_type = "BANDS"
    wave.inputs["Scale"].default_value      = 6.0
    wave.inputs["Distortion"].default_value = 3.0
    noise.inputs["Scale"].default_value     = 18.0
    noise.inputs["Detail"].default_value    = 4.0
    c0, c1 = (color[0]*0.9, color[1]*0.9, color[2]*0.9), color
    ramp.color_ramp.elements[0].color    = (*c0, 1)
    ramp.color_ramp.elements[1].color    = (*c1, 1)
    bump.inputs["Strength"].default_value = 0.2
    nt.links.new(coord.outputs["Generated"], scale.inputs["Vector"])
    nt.links.new(scale.outputs["Vector"], wave.inputs["Vector"])
    nt.links.new(scale.outputs["Vector"], noise.inputs["Vector"])
    nt.links.new(wave.outputs["Fac"],    ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"],  bsdf.inputs["Base Color"])
    nt.links.new(noise.outputs["Fac"],   bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    bsdf.inputs["Roughness"].default_value = 0.35
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    MAT[name] = m
    return m

def mat_tile(name="Tile", color=(0.92, 0.92, 0.92), grout=(0.55, 0.55, 0.55),
             tile_size=0.3):
    if name in MAT: return MAT[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out   = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf  = nt.nodes.new("ShaderNodeBsdfPrincipled")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    scale = nt.nodes.new("ShaderNodeMapping")
    brick = nt.nodes.new("ShaderNodeTexBrick")
    bump  = nt.nodes.new("ShaderNodeBump")
    scale.inputs["Scale"].default_value = (1/tile_size, 1/tile_size, 1)
    brick.inputs["Color1"].default_value = (*color, 1)
    brick.inputs["Color2"].default_value = (*color, 1)
    brick.inputs["Mortar"].default_value = (*grout, 1)
    brick.inputs["Mortar Size"].default_value  = 0.04
    brick.inputs["Mortar Smooth"].default_value = 0.2
    brick.inputs["Scale"].default_value = 1.0
    brick.inputs["Squash"].default_value = 1.0
    bump.inputs["Strength"].default_value = 0.15
    nt.links.new(coord.outputs["Generated"], scale.inputs["Vector"])
    nt.links.new(scale.outputs["Vector"],    brick.inputs["Vector"])
    nt.links.new(brick.outputs["Color"],     bsdf.inputs["Base Color"])
    nt.links.new(brick.outputs["Fac"],       bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"],     bsdf.inputs["Normal"])
    bsdf.inputs["Roughness"].default_value  = 0.12
    bsdf.inputs["Specular IOR Level"].default_value = 0.7
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    MAT[name] = m
    return m

def mat_granite(name="Granite"):
    if name in MAT: return MAT[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out   = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf  = nt.nodes.new("ShaderNodeBsdfPrincipled")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    ramp  = nt.nodes.new("ShaderNodeValToRGB")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    noise.inputs["Scale"].default_value  = 28.0
    noise.inputs["Detail"].default_value = 16.0
    ramp.color_ramp.elements[0].color = (0.08, 0.08, 0.10, 1)
    ramp.color_ramp.elements[1].color = (0.45, 0.42, 0.40, 1)
    e2 = ramp.color_ramp.elements.new(0.5)
    e2.color = (0.35, 0.32, 0.30, 1)
    nt.links.new(coord.outputs["Generated"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"],  ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.08
    bsdf.inputs["Specular IOR Level"].default_value = 0.9
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    MAT[name] = m
    return m

def mat_glass(name="Glass"):
    return mat_plain(name, (0.85, 0.93, 0.97), roughness=0.02,
                     ior=1.52, transmission=0.95)

def mat_brushed_metal(name="BrushedMetal", color=(0.72, 0.72, 0.72)):
    if name in MAT: return MAT[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out  = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfAnisotropic")
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    bsdf.inputs["Color"].default_value     = (*color, 1)
    bsdf.inputs["Roughness"].default_value = 0.15
    bsdf.inputs["Anisotropy"].default_value = 0.6
    MAT[name] = m
    return m

def assign(obj, mat_or_name):
    m = mat_or_name if not isinstance(mat_or_name, str) else MAT.get(mat_or_name)
    if m is None: return
    if obj.data.materials:
        obj.data.materials[0] = m
    else:
        obj.data.materials.append(m)

# ── Mesh helpers ─────────────────────────────────────────────────────────────

def bmesh_obj(name, verts, faces, collection, material=None):
    mesh = bpy.data.meshes.new(name)
    bm   = bmesh.new()
    bvs  = [bm.verts.new(v) for v in verts]
    bm.verts.ensure_lookup_table()
    for f in faces:
        bm.faces.new([bvs[i] for i in f])
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    if material:
        assign(obj, material)
    return obj

def box(name, loc, size, collection, material=None, smooth=False):
    """Create box at loc=(x,y,z) with size=(lx,ly,lz)."""
    x,y,z    = loc
    lx,ly,lz = size
    verts = [
        (x,y,z),(x+lx,y,z),(x+lx,y+ly,z),(x,y+ly,z),
        (x,y,z+lz),(x+lx,y,z+lz),(x+lx,y+ly,z+lz),(x,y+ly,z+lz),
    ]
    faces = [(0,1,2,3),(7,6,5,4),(0,1,5,4),(2,3,7,6),(0,3,7,4),(1,2,6,5)]
    obj = bmesh_obj(name, verts, faces, collection, material)
    if smooth: set_smooth(obj)
    return obj

def cylinder(name, loc, radius, height, segs, collection, material=None, smooth=True):
    mesh = bpy.data.meshes.new(name)
    bm   = bmesh.new()
    bmesh.ops.create_cylinder(bm, cap_ends=True, cap_tris=False,
                               segments=segs, radius1=radius, radius2=radius,
                               depth=height)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    collection.objects.link(obj)
    if material: assign(obj, material)
    if smooth: set_smooth(obj)
    return obj

def rounded_box(name, loc, size, bevel_r, collection, material=None):
    """Box with beveled edges."""
    obj = box(name, loc, size, collection, material)
    add_bevel(obj, width=bevel_r, segs=3)
    set_smooth(obj)
    return obj

# ══════════════════════════════════════════════════════════════════════════════
# ARCHITECTURE — Wall with door/window cutouts (segment method, no booleans)
# ══════════════════════════════════════════════════════════════════════════════

def wall_with_openings(name, x1, y1, x2, y2, openings, collection,
                       height=WH, thick=WT, material=None):
    """
    Draw wall from (x1,y1)→(x2,y2).
    openings = [(s_start, s_width, z_bot, z_top), …]
    Builds solid spans between openings directly in bmesh.
    """
    length = math.hypot(x2-x1, y2-y1)
    angle  = math.atan2(y2-y1, x2-x1)

    cuts = sorted(openings) if openings else []

    def make_span(s0, s1, z0, z1, suffix):
        if s1 <= s0 or z1 <= z0: return
        verts = [
            (s0,0,z0),(s1,0,z0),(s1,thick,z0),(s0,thick,z0),
            (s0,0,z1),(s1,0,z1),(s1,thick,z1),(s0,thick,z1),
        ]
        faces = [(0,1,2,3),(7,6,5,4),(0,1,5,4),(2,3,7,6),(0,3,7,4),(1,2,6,5)]
        mesh = bpy.data.meshes.new(name+suffix)
        bm   = bmesh.new()
        bvs  = [bm.verts.new(v) for v in verts]
        bm.verts.ensure_lookup_table()
        for f in faces:
            bm.faces.new([bvs[i] for i in f])
        bm.to_mesh(mesh); bm.free(); mesh.update()
        obj = bpy.data.objects.new(name+suffix, mesh)
        obj.rotation_euler[2] = angle
        obj.location = (x1, y1, 0)
        collection.objects.link(obj)
        if material: assign(obj, material)

    prev = 0.0
    for idx, (os, ow, oz0, oz1) in enumerate(cuts):
        oe = os + ow
        make_span(prev, os, 0, height, f"_{idx}pre")
        make_span(os, oe, 0,   oz0,   f"_{idx}bot")
        make_span(os, oe, oz1, height, f"_{idx}top")
        prev = oe
    make_span(prev, length, 0, height, "_tail")

# ══════════════════════════════════════════════════════════════════════════════
# FURNITURE — Real geometry
# ══════════════════════════════════════════════════════════════════════════════

def make_sofa_l(loc, collection):
    """L-shaped sectional sofa with seat + back + arms + cushions."""
    x,y,z = loc
    M_sofa  = mat_plain("Sofa_Fabric",     (0.22, 0.22, 0.24), roughness=0.95)
    M_leg   = mat_plain("Sofa_Leg",        (0.12, 0.10, 0.08), roughness=0.60)
    M_cush  = mat_plain("Sofa_Cushion",    (0.28, 0.27, 0.30), roughness=0.90)

    # Base platform
    box("Sofa_Base1",  (x,     y,     z),        (2.40, 0.95, 0.18), collection, M_sofa)
    box("Sofa_Base2",  (x,     y+0.95,z),        (0.95, 1.10, 0.18), collection, M_sofa)
    # Seat cushions long run
    for i in range(3):
        rounded_box(f"Sofa_Seat_{i}", (x+i*0.80+0.01, y+0.01, z+0.18),
                    (0.78, 0.93, 0.22), 0.02, collection, M_cush)
    # Seat cushion corner section
    rounded_box("Sofa_Seat_C", (x+0.01, y+0.96, z+0.18), (0.93, 1.08, 0.22), 0.02, collection, M_cush)
    # Back long
    box("Sofa_Back1", (x, y+0.78, z), (2.40, 0.20, 0.72), collection, M_sofa)
    # Back corner
    box("Sofa_Back2", (x+0.78, y, z), (0.20, 0.95, 0.72), collection, M_sofa)
    # Back cushions
    for i in range(3):
        rounded_box(f"SofaBC_{i}", (x+i*0.80+0.02, y+0.79, z+0.05),
                    (0.76, 0.18, 0.60), 0.02, collection, M_cush)
    # Arms
    box("Sofa_Arm_L",  (x+2.25, y, z),   (0.15, 0.95, 0.55), collection, M_sofa)
    box("Sofa_Arm_F",  (x,     y+2.05-0.15,z),  (0.95, 0.15, 0.55), collection, M_sofa)
    # Legs (4 small cylinders)
    leg_r = 0.035
    for lx2,ly2 in [(x+0.1,y+0.1),(x+2.25,y+0.1),(x+0.1,y+2.0),(x+0.85,y+2.0)]:
        cylinder(f"Sofa_Leg_{lx2:.2f}", (lx2, ly2, z), leg_r, 0.12, 8, collection, M_leg)
    # Throw cushions
    for i,ang in [(0, 0.2),(1,-0.2)]:
        p = rounded_box(f"Sofa_Throw_{i}", (x+2.00+i*(-0.55), y+0.35, z+0.42),
                        (0.42, 0.12, 0.42), 0.04, collection,
                        mat_plain(f"Throw_{i}", (0.8,0.6,0.4) if i==0 else (0.4,0.55,0.6), 0.90))
        p.rotation_euler[2] = ang

def make_coffee_table(loc, collection):
    x,y,z = loc
    M_glass = mat_glass()
    M_metal = mat_brushed_metal()
    # Glass top
    rounded_box("CTbl_Top", (x,y,z+0.40), (1.10, 0.60, 0.02), 0.01, collection, M_glass)
    # Metal legs (4)
    for lx2,ly2 in [(x+0.07,y+0.07),(x+1.03,y+0.07),(x+0.07,y+0.53),(x+1.03,y+0.53)]:
        cylinder(f"CTbl_Leg_{lx2:.2f}", (lx2, ly2, z), 0.02, 0.40, 8, collection, M_metal)
    # Lower shelf
    rounded_box("CTbl_Shelf", (x+0.06,y+0.06,z+0.18), (0.98, 0.48, 0.02), 0.01, collection,
                mat_plain("Shelf_Wood", (0.55,0.38,0.22), 0.55))

def make_tv_unit(loc, size, collection):
    x,y,z = loc
    lx,ly,lz = size
    M_cab  = mat_plain("TVUnit_Mat", (0.12,0.10,0.09), roughness=0.45)
    M_tv   = mat_plain("TV_Screen",  (0.04,0.04,0.06), roughness=0.02)
    M_leg  = mat_brushed_metal("TVU_Leg", (0.45,0.45,0.45))
    # Main cabinet body
    rounded_box("TVUnit_Body", (x,y,z), (lx, ly, lz), 0.02, collection, M_cab)
    # Door lines (etched)
    gap = 0.015
    panel_w = (lx - gap*4) / 3
    for i in range(3):
        box(f"TVD_{i}", (x+gap+i*(panel_w+gap), y-0.002, z+gap),
            (panel_w, 0.003, lz-gap*2), collection, mat_plain("TVDoor", (0.16,0.14,0.12), 0.40))
    # Legs
    for lx2,ly2 in [(x+0.08,y+0.04),(x+lx-0.08,y+0.04),(x+0.08,y+ly-0.04),(x+lx-0.08,y+ly-0.04)]:
        cylinder(f"TVU_Leg_{lx2:.2f}", (lx2,ly2,z-0.12), 0.025, 0.12, 8, collection, M_leg)
    # TV panel
    tv_h = 0.85; tv_w = 1.55; tv_d = 0.045
    tv_x = x + (lx - tv_w)/2
    rounded_box("TV_Panel", (tv_x, y-0.01, z+lz+0.05), (tv_w, tv_d, tv_h), 0.01, collection,
                mat_plain("TV_Body", (0.06,0.06,0.06), 0.30))
    # Screen
    rounded_box("TV_Screen_R", (tv_x+0.025, y-0.025, z+lz+0.07), (tv_w-0.05, 0.005, tv_h-0.06),
                0.005, collection, M_tv)
    # TV stand
    box("TV_Stand", (tv_x+tv_w/2-0.1, y-0.01, z+lz), (0.20, 0.12, 0.05), collection,
        mat_plain("TVSt", (0.06,0.06,0.06), 0.3))

def make_carpet(loc, size, color, collection):
    x,y,z = loc
    lx,ly = size
    rounded_box("Carpet", (x,y,z+0.005), (lx, ly, 0.008), 0.02, collection,
                mat_plain("Carpet_Mat", color, roughness=0.98))

def make_indoor_plant(name, loc, collection):
    x,y,z = loc
    M_pot  = mat_plain("Pot_Clay", (0.60,0.35,0.22), 0.85)
    M_soil = mat_plain("Soil",     (0.22,0.16,0.10), 0.95)
    M_leaf = mat_plain("Leaf",     (0.12,0.45,0.12), 0.90)
    # Pot
    cylinder(name+"_pot",  (x,y,z),      0.18, 0.30, 16, collection, M_pot)
    cylinder(name+"_soil", (x,y,z+0.28), 0.16, 0.02, 16, collection, M_soil)
    # Stem + leaves (simplified icosphere clusters)
    stem_h = 0.6
    box(name+"_stem", (x-0.01,y-0.01,z+0.30), (0.02,0.02,stem_h), collection, M_leaf)
    # 5 leaf clusters
    for i in range(5):
        ang  = i * 1.257
        r    = 0.12 + (i%2)*0.08
        lz2  = z+0.30+stem_h*(0.4+i*0.12)
        lx2  = x + r*math.cos(ang)
        ly2  = y + r*math.sin(ang)
        leaf = rounded_box(name+f"_leaf{i}", (lx2-0.10,ly2-0.08,lz2),
                           (0.20,0.16,0.04), 0.04, collection, M_leaf)
        leaf.rotation_euler[2] = ang

def make_dining_set(loc, collection):
    x,y,z = loc
    M_tbl  = mat_wood("DiningTbl_Wood", (0.50,0.32,0.16))
    M_ch   = mat_plain("Chair_Fabric",   (0.35,0.30,0.26), 0.88)
    M_leg  = mat_plain("Chair_Leg",      (0.18,0.14,0.10), 0.55)
    # Table top
    rounded_box("DT_Top", (x,y,z+0.74), (1.60, 0.90, 0.04), 0.02, collection, M_tbl)
    # Table legs (4)
    for lx2,ly2 in [(x+0.08,y+0.08),(x+1.52,y+0.08),(x+0.08,y+0.82),(x+1.52,y+0.82)]:
        box(f"DT_Leg_{lx2:.2f}", (lx2,ly2,z), (0.06,0.06,0.74), collection, M_leg)

    def chair(cname, cx, cy, rot):
        # Seat
        rounded_box(cname+"_seat", (cx,cy,z+0.45), (0.44,0.44,0.06), 0.02, collection, M_ch)
        # Back (2 vertical bars + top rail)
        for i in range(3):
            box(cname+f"_back{i}", (cx+0.06+i*0.15,cy+0.38,z+0.45),(0.05,0.06,0.50), collection, M_leg)
        rounded_box(cname+"_rail", (cx+0.01,cy+0.36,z+0.92),(0.42,0.08,0.04), 0.01, collection, M_leg)
        # 4 legs
        for lx2,ly2 in [(cx+0.04,cy+0.04),(cx+0.40,cy+0.04),
                         (cx+0.04,cy+0.40),(cx+0.40,cy+0.40)]:
            cylinder(cname+f"leg{lx2:.2f}", (lx2,ly2,z), 0.022, 0.45, 8, collection, M_leg)
        # Seat pad
        rounded_box(cname+"_pad", (cx+0.02,cy+0.02,z+0.51),(0.40,0.40,0.04), 0.02, collection, M_ch)

    positions = [
        (x-0.52, y+0.23, 0),
        (x+1.60+0.08, y+0.23, math.pi),
        (x+0.18, y-0.55, math.pi/2),
        (x+0.78, y-0.55, math.pi/2),
        (x+0.18, y+0.90+0.11, -math.pi/2),
        (x+0.78, y+0.90+0.11, -math.pi/2),
    ]
    for i, (cx,cy,rot) in enumerate(positions):
        chair(f"DC_{i}", cx, cy, rot)

def make_king_bed(loc, collection):
    x,y,z = loc
    M_frame  = mat_wood("Bed_Frame", (0.35,0.22,0.10))
    M_matt   = mat_plain("Mattress", (0.96,0.95,0.93), 0.88)
    M_sheet  = mat_plain("Sheet",    (0.98,0.97,0.95), 0.85)
    M_pillow = mat_plain("Pillow",   (0.99,0.99,0.99), 0.80)
    M_duvet  = mat_plain("Duvet",    (0.94,0.92,0.90), 0.90)
    M_head   = mat_plain("Headbd",   (0.22,0.18,0.14), 0.70)

    # Platform base
    rounded_box("Bed_Base",   (x,y,z),      (1.85,2.10,0.30), 0.02, collection, M_frame)
    # Mattress
    rounded_box("Bed_Matt",   (x+0.02,y+0.02,z+0.30), (1.81,2.06,0.25), 0.03, collection, M_matt)
    # Sheet (flat, draped appearance)
    rounded_box("Bed_Sheet",  (x+0.02,y+0.02,z+0.55), (1.81,2.06,0.02), 0.01, collection, M_sheet)
    # Duvet (folded at foot)
    rounded_box("Bed_Duvet",  (x+0.02,y+0.02,z+0.55), (1.81,1.30,0.12), 0.03, collection, M_duvet)
    # Pillows
    for i in range(2):
        rounded_box(f"Bed_Pillow{i}", (x+0.12+i*0.90, y+1.50, z+0.57),
                    (0.72,0.50,0.15), 0.04, collection, M_pillow)
    # Headboard (upholstered panel)
    rounded_box("Bed_Head", (x-0.02,y+1.98,z), (1.89,0.10,1.10), 0.04, collection, M_head)
    # Side tables
    M_side = mat_plain("Sidetable", (0.28,0.22,0.16), 0.60)
    for i in range(2):
        stx = x - 0.55 if i==0 else x+1.85+0.05
        rounded_box(f"Sidetbl_{i}", (stx, y+1.35, z), (0.50,0.55,0.55), 0.02, collection, M_side)
        # Lamp on side table
        lamp_r = 0.12; lamp_h = 0.28
        cylinder(f"Lamp_{i}_base", (stx+0.25, y+1.625, z+0.55), 0.05, lamp_h, 12, collection,
                 mat_brushed_metal())
        cylinder(f"Lamp_{i}_shade", (stx+0.25, y+1.625, z+0.55+lamp_h-0.02), 0.18, 0.22, 16,
                 collection, mat_plain(f"LShade_{i}", (0.95,0.88,0.75), 0.85))

def make_queen_bed(loc, collection):
    x,y,z = loc
    M_frame  = mat_wood("QBed_Frame", (0.40,0.28,0.14))
    M_matt   = mat_plain("QMattress", (0.95,0.94,0.92), 0.88)
    M_pillow = mat_plain("QPillow",   (0.99,0.99,0.99), 0.80)
    M_duvet  = mat_plain("QDuvet",    (0.75,0.80,0.88), 0.88)
    M_head   = mat_plain("QHead",     (0.35,0.25,0.15), 0.65)
    rounded_box("QB_Base",  (x,y,z),       (1.60,2.00,0.28), 0.02, collection, M_frame)
    rounded_box("QB_Matt",  (x+0.02,y+0.02,z+0.28), (1.56,1.96,0.22), 0.03, collection, M_matt)
    rounded_box("QB_Duvet", (x+0.02,y+0.02,z+0.50), (1.56,1.25,0.10), 0.03, collection, M_duvet)
    for i in range(2):
        rounded_box(f"QB_Pillow{i}", (x+0.10+i*0.78,y+1.45,z+0.52),
                    (0.65,0.45,0.13), 0.04, collection, M_pillow)
    rounded_box("QB_Head", (x-0.02,y+1.88,z), (1.64,0.08,1.00), 0.04, collection, M_head)
    # Side table (one)
    rounded_box("QB_Side",  (x+1.65+0.05,y+1.25,z), (0.45,0.50,0.52), 0.02, collection,
                mat_plain("QSide", (0.32,0.24,0.16), 0.60))

def make_wardrobe(loc, size, collection):
    x,y,z = loc
    lx,ly,lz = size
    M_body  = mat_plain("Ward_Body", (0.88,0.86,0.83), roughness=0.35)
    M_door  = mat_plain("Ward_Door", (0.90,0.88,0.85), roughness=0.20)
    M_handle = mat_brushed_metal("WardH", (0.65,0.65,0.65))
    # Carcass
    box("Ward_Body", (x,y,z), (lx,ly,lz), collection, M_body)
    # 3 door panels
    dp = (lx - 0.01) / 3
    for i in range(3):
        dx = x + i*dp + 0.002
        rounded_box(f"Ward_Dr{i}", (dx,y-0.005,z+0.02), (dp-0.004,0.02,lz-0.04), 0.01,
                    collection, M_door)
        # Handle
        cylinder(f"Ward_H{i}", (dx+dp/2, y-0.02, z+lz/2), 0.008, 0.12, 8, collection, M_handle)

def make_study_desk(loc, collection):
    x,y,z = loc
    M_top = mat_wood("Desk_Wood", (0.50,0.32,0.18))
    M_leg = mat_plain("Desk_Leg",  (0.25,0.22,0.20), 0.60)
    M_pc  = mat_plain("PC_Body",   (0.12,0.12,0.14), 0.20)
    M_scr = mat_plain("Screen",    (0.04,0.04,0.06), 0.02)
    # Desk top
    rounded_box("Desk_Top", (x,y,z+0.75), (1.20,0.60,0.03), 0.01, collection, M_top)
    # Legs
    for lx2,ly2 in [(x+0.04,y+0.04),(x+1.16,y+0.04),(x+0.04,y+0.56),(x+1.16,y+0.56)]:
        box(f"Desk_L_{lx2:.2f}", (lx2,ly2,z), (0.04,0.04,0.75), collection, M_leg)
    # Monitor
    rounded_box("Mon_Panel", (x+0.30,y+0.50,z+0.75+0.03), (0.60,0.04,0.36), 0.01, collection, M_pc)
    rounded_box("Mon_Screen", (x+0.32,y+0.48,z+0.75+0.05), (0.56,0.005,0.32), 0.005, collection, M_scr)
    box("Mon_Stand", (x+0.54,y+0.46,z+0.75+0.02), (0.12,0.12,0.03), collection, M_pc)
    # Keyboard
    rounded_box("Keyboard", (x+0.24,y+0.12,z+0.78), (0.55,0.18,0.02), 0.005, collection,
                mat_plain("KB", (0.15,0.15,0.17), 0.75))
    # Chair
    M_dcf = mat_plain("DeskChair", (0.12,0.12,0.14), 0.85)
    rounded_box("DC_Seat", (x+0.30,y-0.55,z+0.45), (0.50,0.50,0.08), 0.04, collection, M_dcf)
    rounded_box("DC_Back", (x+0.30,y-0.10,z+0.45), (0.50,0.06,0.55), 0.03, collection, M_dcf)
    cylinder("DC_Post",    (x+0.55,y-0.30,z+0.10), 0.03, 0.35, 8, collection, mat_brushed_metal())
    cylinder("DC_Base",    (x+0.55,y-0.30,z+0.03), 0.25, 0.04, 5, collection, mat_brushed_metal())

def make_kitchen(loc, collection):
    x,y,z = loc  # SW corner of kitchen zone
    M_base  = mat_plain("KC_Body",   (0.92,0.88,0.85), 0.30)
    M_door  = mat_plain("KC_Door",   (0.94,0.90,0.88), 0.15)
    M_ctp   = mat_granite()
    M_up    = mat_plain("KC_Upper",  (0.92,0.88,0.85), 0.30)
    M_sink  = mat_brushed_metal("Sink", (0.75,0.75,0.75))
    M_appl  = mat_plain("Appliance", (0.20,0.20,0.22), 0.25)
    M_chim  = mat_plain("Chimney",   (0.18,0.18,0.20), 0.15, metallic=0.7)
    M_glass_cab = mat_plain("GlassCab", (0.80,0.88,0.92), 0.05, alpha=0.4)

    # ── Lower cabinets (along south wall, x direction) ──
    lc_depth = 0.60; lc_h = 0.87; ctp_t = 0.04
    lc_w     = 2.20
    box("LC_Body", (x,y,z), (lc_w, lc_depth, lc_h), collection, M_base)
    # 3 door fronts
    for i in range(3):
        dw = lc_w/3
        rounded_box(f"LC_Dr{i}", (x+i*dw+0.01,y-0.005,z+0.02),
                    (dw-0.02, 0.02, lc_h-0.04), 0.01, collection, M_door)
    # Countertop
    rounded_box("LC_CTop", (x-0.02,y-0.02,z+lc_h), (lc_w+0.04, lc_depth+0.04, ctp_t),
                0.01, collection, M_ctp)

    # ── Sink section ──
    sx = x + lc_w
    box("Sink_Body", (sx,y,z), (0.80,lc_depth,lc_h), collection, M_base)
    rounded_box("Sink_CTop", (sx-0.01,y-0.02,z+lc_h), (0.82,lc_depth+0.04,ctp_t), 0.01, collection, M_ctp)
    # Sink basin cutout (inner box showing metal)
    box("Sink_Basin", (sx+0.15,y+0.10,z+lc_h-0.15), (0.52,0.36,0.15), collection, M_sink)
    # Tap
    cylinder("Tap_Body", (sx+0.42,y+0.12,z+lc_h+ctp_t), 0.018, 0.18, 8, collection, M_sink)
    box("Tap_Spout", (sx+0.41,y+0.12,z+lc_h+ctp_t+0.15), (0.03,0.25,0.03), collection, M_sink)

    # ── East wall lower cabinets ──
    ec_w = 0.60; ec_len = 2.20
    box("EC_Body", (x+lc_w+0.80+ec_w,y,z), (ec_w, ec_len, lc_h), collection, M_base)
    rounded_box("EC_CTop", (x+lc_w+0.80+ec_w-0.02,y-0.02,z+lc_h),
                (ec_w+0.04, ec_len+0.04, ctp_t), 0.01, collection, M_ctp)

    # ── Upper cabinets (south wall) ──
    uc_bot = 1.65; uc_h = 0.65; uc_d = 0.35
    box("UC_Body", (x,y+lc_depth-uc_d,uc_bot), (lc_w+0.80, uc_d, uc_h), collection, M_up)
    # Glass door on centre section
    box("UC_GlDr", (x+lc_w/2,y+lc_depth-uc_d-0.005,uc_bot+0.02),
        (lc_w/2-0.01, 0.01, uc_h-0.04), collection, M_glass_cab)

    # ── Refrigerator ──
    rx = x + lc_w + 0.80 + 0.05
    rounded_box("Fridge_Body", (rx, y, z), (0.68,0.68,1.85), 0.03, collection, M_appl)
    rounded_box("Fridge_DH",  (rx, y-0.015, z+0.98), (0.68,0.68,0.01), 0.005, collection,
                mat_plain("FH", (0.25,0.25,0.25), 0.20))
    cylinder("Fridge_Hndl", (rx+0.06,y-0.04,z+1.50), 0.012, 0.55, 8, collection,
             mat_brushed_metal("FH2",(0.75,0.75,0.75)))

    # ── Chimney ──
    ch_x = x + 0.60; ch_y = y + lc_depth - 0.35
    box("Chim_Hood",  (ch_x, ch_y, z+lc_h+0.03), (0.80,0.35,0.35), collection, M_chim)
    box("Chim_Pipe",  (ch_x+0.30, ch_y+0.10, z+lc_h+0.38), (0.20,0.15,0.55), collection, M_chim)
    # Hob
    rounded_box("Hob", (x+0.15,y-0.01,z+lc_h+ctp_t), (0.80,0.50,0.03), 0.01, collection,
                mat_plain("Hob_B", (0.10,0.10,0.12), 0.10))
    for bx2,by2 in [(x+0.30,y+0.12),(x+0.65,y+0.12),(x+0.30,y+0.37),(x+0.65,y+0.37)]:
        cylinder(f"Burner_{bx2:.2f}", (bx2,by2,z+lc_h+ctp_t+0.03), 0.07, 0.02, 16, collection,
                 mat_brushed_metal("Brnr",(0.55,0.55,0.55)))

    # ── Microwave (on upper cabinet shelf) ──
    rounded_box("Microwave", (x, y+lc_depth-uc_d, uc_bot-0.42),
                (0.52,0.34,0.32), 0.02, collection, M_appl)
    box("MW_Screen", (x+0.01, y+lc_depth-uc_d-0.005, uc_bot-0.41),
        (0.35,0.005,0.30), collection,
        mat_plain("MWS", (0.04,0.04,0.06), 0.02))

def make_bathroom(loc, size, is_master, collection):
    """
    loc = (x,y,z) SW corner inside the bathroom
    size = (width, depth)
    """
    x,y,z = loc
    bw,bd  = size
    M_wc   = mat_plain("WC_Ceramic", (0.97,0.97,0.97), 0.10)
    M_chr  = mat_plain("WC_Chrome",  (0.85,0.85,0.87), 0.08, metallic=0.9)
    M_cab  = mat_plain("Bath_Cab",   (0.88,0.86,0.84), 0.25)
    M_mir  = mat_glass("Bath_Mirror")
    M_tile = mat_tile("Bath_Tile", (0.93,0.93,0.93))

    # ── WC ──
    # Pan
    rounded_box("WC_Pan", (x+0.08,y+0.08,z), (0.40,0.60,0.42), 0.05, collection, M_wc)
    # Tank
    rounded_box("WC_Tank", (x+0.08,y+0.48,z+0.42), (0.40,0.18,0.30), 0.02, collection, M_wc)
    # Seat
    rounded_box("WC_Seat", (x+0.07,y+0.07,z+0.42), (0.42,0.36,0.04), 0.04, collection,
                mat_plain("WCSeat", (0.96,0.96,0.96), 0.12))

    # ── Wash basin ──
    bx = x + (bw - 0.55)/2
    rounded_box("Basin_Cab",  (bx-0.02,y+0.75,z),       (0.59,0.45,0.85), 0.02, collection, M_cab)
    rounded_box("Basin_Bowl", (bx,y+0.76,z+0.82),        (0.55,0.42,0.15), 0.05, collection, M_wc)
    cylinder("Basin_Drain",   (bx+0.275,y+0.97,z+0.82),  0.025, 0.04, 12, collection, M_chr)
    cylinder("Tap_Basin",     (bx+0.275,y+0.88,z+0.97),  0.015, 0.14, 8,  collection, M_chr)
    box("Tap_Spout_B",        (bx+0.265,y+0.88,z+0.97+0.12),(0.03,0.15,0.025), collection, M_chr)

    # ── Mirror ──
    mir_w = min(bw-0.20, 0.70)
    rounded_box("Bath_Mirror", (x+(bw-mir_w)/2, y+bd-0.045, z+0.90),
                (mir_w, 0.04, 0.60), 0.005, collection, M_mir)
    # Mirror frame
    rounded_box("Mir_Frame",   (x+(bw-mir_w)/2-0.02, y+bd-0.045, z+0.88),
                (mir_w+0.04, 0.02, 0.64), 0.01, collection, M_chr)

    if is_master:
        # ── Shower enclosure ──
        sh_x = x + 0.02
        sh_y = y + 1.50
        sh_w = min(bw - 0.04, 0.90)
        sh_d = bd - 1.52
        # Glass walls
        box("Shw_GlassL", (sh_x,      sh_y,         z),    (0.01, sh_d, 2.10), collection, M_chr)
        box("Shw_GlassFr",(sh_x,      sh_y,         z),    (sh_w, 0.01, 2.10), collection, mat_glass())
        box("Shw_GlassR", (sh_x+sh_w, sh_y,         z),    (0.01, sh_d, 2.10), collection, M_chr)
        # Shower head
        cylinder("Shw_Arm",  (sh_x+sh_w/2, sh_y+sh_d/2, z+2.05), 0.015, 0.25, 8, collection, M_chr)
        cylinder("Shw_Head", (sh_x+sh_w/2, sh_y+sh_d/2, z+1.85), 0.08,  0.04, 16,collection, M_chr)
        # Tray
        rounded_box("Shw_Tray", (sh_x,sh_y,z-0.02), (sh_w, sh_d, 0.04), 0.01, collection,
                    mat_plain("ShwTray", (0.92,0.92,0.92), 0.08))
    else:
        # Simple shower over tub for common bath
        rounded_box("Tub", (x+0.02, y+1.30, z), (bw-0.04, bd-1.32, 0.55), 0.04, collection, M_wc)
        cylinder("CB_ShwH", (x+bw/2, y+bd-0.20, z+1.90), 0.07, 0.03, 16, collection, M_chr)

def make_balcony_furniture(loc, collection):
    x,y,z = loc
    M_out = mat_plain("Outdoor_Metal", (0.45,0.45,0.48), 0.40, metallic=0.7)
    M_cush= mat_plain("Out_Cushion",   (0.35,0.52,0.45), 0.90)
    M_pot = mat_plain("Planter_Ceram", (0.70,0.38,0.25), 0.80)
    M_leaf= mat_plain("Outdoor_Leaf",  (0.20,0.52,0.18), 0.90)
    # Table
    rounded_box("Bal_Tbl", (x+0.40,y+0.20,z+0.72), (0.80,0.60,0.04), 0.02, collection, M_out)
    for lx2,ly2 in [(x+0.45,y+0.24),(x+1.14,y+0.24),(x+0.45,y+0.72),(x+1.14,y+0.72)]:
        cylinder(f"BT_L{lx2:.2f}", (lx2,ly2,z), 0.020, 0.72, 8, collection, M_out)
    # 2 chairs
    for i in range(2):
        cx = x + 0.10 + i * 1.10
        rounded_box(f"BChair_{i}", (cx, y+0.22, z+0.44), (0.44,0.44,0.06), 0.03, collection, M_out)
        rounded_box(f"BCush_{i}",  (cx+0.01,y+0.23,z+0.50),(0.42,0.42,0.04), 0.03, collection, M_cush)
        rounded_box(f"BBack_{i}",  (cx, y+0.60, z+0.44), (0.44,0.06,0.55), 0.03, collection, M_out)
        for lx2,ly2 in [(cx+0.04,y+0.26),(cx+0.40,y+0.26),(cx+0.04,y+0.60),(cx+0.40,y+0.60)]:
            cylinder(f"BCL{i}{lx2:.2f}",(lx2,ly2,z),0.018,0.44,8,collection,M_out)
    # Planter pots
    for i, px in enumerate([x+0.05, x+2.30]):
        py = y + 0.10 + i*0.60
        cylinder(f"Pltr_{i}", (px, py, z), 0.22, 0.38, 16, collection, M_pot)
        # Plant leaves
        for j in range(4):
            ang = j * 1.57
            lx2 = px + 0.14*math.cos(ang); ly2 = py + 0.14*math.sin(ang)
            leaf = rounded_box(f"PL_{i}_{j}", (lx2-0.12,ly2-0.08,z+0.38),
                               (0.24,0.16,0.06), 0.04, collection, M_leaf)
            leaf.rotation_euler[2] = ang

# ══════════════════════════════════════════════════════════════════════════════
# WINDOW + DOOR UNITS
# ══════════════════════════════════════════════════════════════════════════════

def window_frame(name, x, y, z, w, h, angle, collection):
    M_fr = mat_plain("Win_Frame", (0.94,0.92,0.90), 0.40)
    M_gl = mat_glass()
    ft   = 0.055
    def seg(sfx, lx,ly,lz, slx,sly,slz):
        b = box(name+sfx, (lx,ly,lz), (slx,sly,slz), collection, M_fr)
        b.rotation_euler[2] = angle
        return b
    def gl_pane(sfx, lx,ly,lz, slx,sly,slz):
        b = box(name+sfx, (lx,ly,lz), (slx,sly,slz), collection, M_gl)
        b.rotation_euler[2] = angle
        return b
    # Outer frame
    seg("_fL",  x,       y, z,      ft,   WT, h)
    seg("_fR",  x+w-ft,  y, z,      ft,   WT, h)
    seg("_fT",  x,       y, z+h-ft, w,    WT, ft)
    seg("_fB",  x,       y, z,      w,    WT, ft)
    # Glass
    gl_pane("_gl", x+ft, y+ft, z+ft, w-2*ft, WT-2*ft, h-2*ft)
    # Sill
    seg("_sill", x-0.04, y-0.04, z-ft, w+0.08, WT+0.08, ft)

def door_frame(name, x, y, z, w, h, angle, collection, mat_leaf=None):
    M_fr = mat_plain("Door_Frame", (0.92,0.90,0.87), 0.45)
    M_lf = mat_leaf or mat_plain("Door_Leaf", (0.68,0.52,0.35), 0.55)
    M_hnd= mat_brushed_metal("DoorHnd", (0.72,0.72,0.70))
    ft   = 0.06
    def seg(sfx,lx,ly,lz,slx,sly,slz):
        b = box(name+sfx,(lx,ly,lz),(slx,sly,slz),collection,M_fr)
        b.rotation_euler[2]=angle
    # Frame members
    seg("_fL", x-ft,     y,   z,    ft,   WT+ft, h+ft)
    seg("_fR", x+w,      y,   z,    ft,   WT+ft, h+ft)
    seg("_fT", x-ft,     y,   z+h,  w+2*ft, WT+ft, ft)
    # Door leaf (slightly open at 15°)
    leaf = box(name+"_leaf", (x, y+0.02, z), (w, 0.04, h), collection, M_lf)
    leaf.rotation_euler[2] = angle + math.radians(15)
    # Handle
    cylinder(name+"_hnd", (x+w-0.10, y, z+h*0.50), 0.012, 0.12, 8, collection, M_hnd)
    # Panel moulding
    box(name+"_pan", (x+0.08,y+0.02,z+0.10), (w-0.16,0.02,h-0.20), collection,
        mat_plain("DoorPanel",(0.72,0.56,0.38),0.55))

# ══════════════════════════════════════════════════════════════════════════════
# SKIRTING, CORNICES
# ══════════════════════════════════════════════════════════════════════════════

def skirting_rect(name, x1, y1, x2, y2, collection, h=0.10, t=0.015):
    M = mat_plain("Skirting", (0.96,0.95,0.93), 0.50)
    from math import hypot, atan2
    length = hypot(x2-x1, y2-y1)
    angle  = atan2(y2-y1, x2-x1)
    b = box(name, (0,0,0), (length,t,h), collection, M)
    b.rotation_euler[2] = angle
    b.location = (x1,y1,0)

def cornice_rect(name, x1, y1, x2, y2, collection, h=0.08, t=0.08):
    M = mat_plain("Cornice", (0.97,0.97,0.96), 0.65)
    from math import hypot, atan2
    length = hypot(x2-x1, y2-y1)
    angle  = atan2(y2-y1, x2-x1)
    b = box(name, (0,0,WH-h), (length,t,h), collection, M)
    b.rotation_euler[2] = angle
    b.location = (x1,y1,0)

# ══════════════════════════════════════════════════════════════════════════════
# FALSE CEILING + LED COVES
# ══════════════════════════════════════════════════════════════════════════════

def false_ceiling_cove(name, x, y, lx, ly, drop, collection):
    """Recessed tray ceiling with LED cove around perimeter."""
    M_ceil  = mat_plain("FCeil",    (0.97,0.97,0.96), 0.85)
    M_tray  = mat_plain("FCeilTray",(0.96,0.95,0.94), 0.85)
    M_led   = mat_plain("LED_Cove", (1.00,0.95,0.80), 0.0,
                         emission=(1.00,0.95,0.80))
    cove_w  = 0.30
    z_main  = WH
    z_drop  = WH - drop
    # Outer ring (flush with main ceiling)
    for seg_name, sx, sy, sw, sd in [
        (name+"_N", x,        y+ly-cove_w, lx,     cove_w),
        (name+"_S", x,        y,            lx,     cove_w),
        (name+"_W", x,        y+cove_w,     cove_w, ly-2*cove_w),
        (name+"_E", x+lx-cove_w, y+cove_w, cove_w, ly-2*cove_w),
    ]:
        box(seg_name, (sx,sy,z_drop), (sw,sd,drop), collection, M_ceil)
    # Inner tray (lower ceiling)
    box(name+"_Inner", (x+cove_w,y+cove_w,z_drop-0.01),
        (lx-2*cove_w, ly-2*cove_w, 0.015), collection, M_tray)
    # LED strip (thin emissive strip along inner edge)
    led_t = 0.015
    for seg_name, sx, sy, sw, sd in [
        (name+"_LN", x+cove_w,        y+ly-cove_w-led_t, lx-2*cove_w, led_t),
        (name+"_LS", x+cove_w,        y+cove_w,           lx-2*cove_w, led_t),
        (name+"_LW", x+cove_w,        y+cove_w+led_t,     led_t, ly-2*cove_w-2*led_t),
        (name+"_LE", x+lx-cove_w-led_t,y+cove_w+led_t,   led_t, ly-2*cove_w-2*led_t),
    ]:
        box(seg_name, (sx,sy,z_drop), (sw,sd,0.02), collection, M_led)

def ceiling_light(name, x, y, collection):
    """Recessed spot / downlight."""
    M_ring = mat_plain("DL_Ring", (0.85,0.85,0.85), 0.20, metallic=0.5)
    cylinder(name+"_ring", (x,y,WH-0.02), 0.055, 0.025, 16, collection, M_ring)
    # Point light linked (lamp)
    bpy.ops.object.light_add(type="POINT", location=(x, y, WH-0.08))
    lt = bpy.context.active_object
    lt.name = name+"_lt"
    lt.data.energy = 18
    lt.data.color  = (1.00, 0.90, 0.75)
    lt.data.shadow_soft_size = 0.05
    collection.objects.link(lt)
    bpy.context.scene.collection.objects.unlink(lt)

# ══════════════════════════════════════════════════════════════════════════════
# CAMERAS
# ══════════════════════════════════════════════════════════════════════════════

def add_camera(name, loc, target, collection, lens=28):
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.active_object
    cam.name = name
    cam.data.lens = lens
    cam.data.clip_start = 0.1
    cam.data.clip_end   = 50
    dx, dy, dz = target[0]-loc[0], target[1]-loc[1], target[2]-loc[2]
    pitch = math.atan2(-dz, math.hypot(dx, dy))
    yaw   = math.atan2(dy, dx) - math.pi/2
    cam.rotation_euler = (math.pi/2 + pitch, 0, yaw)
    collection.objects.link(cam)
    try: bpy.context.scene.collection.objects.unlink(cam)
    except: pass
    return cam

def create_fly_path(cameras, collection):
    """Create a NurbsPath that visits all camera positions for animation."""
    bpy.ops.curve.primitive_nurbs_path_add(radius=1, enter_editmode=False, location=(0,0,0))
    path = bpy.context.active_object
    path.name = "FlyThrough_Path"
    collection.objects.link(path)
    try: bpy.context.scene.collection.objects.unlink(path)
    except: pass
    return path

# ══════════════════════════════════════════════════════════════════════════════
# MAIN BUILD
# ══════════════════════════════════════════════════════════════════════════════

print("Clearing scene…")
clear_scene()

# Collections
C_struct  = coll("Structure")
C_floors  = coll("Floors")
C_ceil    = coll("Ceilings")
C_open    = coll("Openings")      # doors + windows
C_kit     = coll("Kitchen")
C_living  = coll("Living")
C_dining  = coll("Dining")
C_mbr     = coll("Master_BR")
C_br2     = coll("Bedroom2")
C_bath    = coll("Bathrooms")
C_bal     = coll("Balcony")
C_lights  = coll("Lights")
C_cam     = coll("Cameras")

# ── MATERIALS (pre-build) ────────────────────────────────────────────────────
M_wall   = mat_plain("Wall_Paint",  (0.96,0.95,0.93), roughness=0.90)
M_marble = mat_marble()
M_wood   = mat_wood("BR_Wood",      (0.45,0.30,0.16))
M_btile  = mat_tile("Bath_Tile",    (0.92,0.92,0.92), grout=(0.50,0.50,0.50), tile_size=0.25)
M_ktile  = mat_tile("Kitchen_Tile", (0.88,0.86,0.84), grout=(0.55,0.55,0.55), tile_size=0.30)
M_otile  = mat_tile("Outdoor_Tile", (0.70,0.68,0.65), grout=(0.48,0.48,0.48), tile_size=0.40)
M_glass  = mat_glass()
M_slab   = mat_plain("Slab",        (0.82,0.80,0.78), roughness=0.70)
M_railing= mat_brushed_metal("Railing")

# ── FLOOR SLAB ───────────────────────────────────────────────────────────────
box("Slab", (-WT,-WT,-FH), (9.4+2*WT, 8.5+2*WT, FH), C_struct, M_slab)

# ── ROOM FLOORS ──────────────────────────────────────────────────────────────
# Foyer (marble)
box("Fl_Foyer",   (0,   0,   0), (1.5, 1.8, 0.02), C_floors, M_marble)
# Living/Dining (marble)
box("Fl_Living",  (1.5, 0,   0), (5.3, 4.2, 0.02), C_floors, M_marble)
# Kitchen
box("Fl_Kitchen", (6.8, 0,   0), (2.6, 3.0, 0.02), C_floors, M_ktile)
# Balcony
box("Fl_Balcony", (6.8, 3.0, 0), (2.6, 1.2, 0.02), C_floors, M_otile)
# Master BR
box("Fl_MBR",     (0,   4.2, 0), (4.2, 4.3, 0.02), C_floors, M_wood)
# Master Bath
box("Fl_MBath",   (0,   7.0, 0), (2.0, 1.5, 0.02), C_floors, M_btile)
# BR2
box("Fl_BR2",     (4.2, 4.2, 0), (3.8, 4.3, 0.02), C_floors, M_wood)
# Common Bath
box("Fl_CBath",   (8.0, 4.2, 0), (1.4, 3.0, 0.02), C_floors, M_btile)

# ── MAIN CEILING ─────────────────────────────────────────────────────────────
box("Ceil_Main", (-WT, -WT, WH), (9.4+2*WT, 8.5+2*WT, 0.12), C_ceil,
    mat_plain("Ceiling", (0.98,0.98,0.97), roughness=0.90))

# ── FALSE CEILINGS WITH LED COVES ────────────────────────────────────────────
false_ceiling_cove("FC_Living",  1.5, 0.0, 5.3, 4.2, 0.18, C_ceil)
false_ceiling_cove("FC_MBR",     0.0, 4.2, 4.2, 4.3, 0.15, C_ceil)
false_ceiling_cove("FC_BR2",     4.2, 4.2, 3.8, 4.3, 0.15, C_ceil)

# ── EXTERIOR WALLS ───────────────────────────────────────────────────────────
# South wall (y=0 face, towards viewer)
wall_with_openings("EW_South", -WT, -WT, 9.4+WT, -WT,
    [(0.50,  DW,   0,   DH),          # Entry door
     (2.10,  WW,   WSH, WSH+WWH),     # Living W1
     (3.70,  WW,   WSH, WSH+WWH),     # Living W2
     (7.10,  WW,   WSH, WSH+WWH),     # Kitchen W
    ], C_struct, material=M_wall)

# North wall
wall_with_openings("EW_North", -WT, 8.5+WT, 9.4+WT, 8.5+WT,
    [(0.90,  WW,  WSH, WSH+WWH),      # MBR N
     (5.00,  WW,  WSH, WSH+WWH),      # BR2 N
    ], C_struct, material=M_wall)

# West wall
wall_with_openings("EW_West", -WT, -WT, -WT, 8.5+WT,
    [(5.40, WW,  WSH, WSH+WWH),       # MBR W
    ], C_struct, material=M_wall)

# East wall
wall_with_openings("EW_East", 9.4+WT, -WT, 9.4+WT, 8.5+WT,
    [(0.50, WW,  WSH, WSH+WWH),       # Kitchen E
     (4.50, 0.60, 1.60, 2.20),        # CBath high window
    ], C_struct, material=M_wall)

# ── INTERIOR WALLS ───────────────────────────────────────────────────────────
# Foyer east (x=1.5, y=0→1.8) – wide arch
wall_with_openings("IW_Foyer_E", 1.5, 0, 1.5, 1.8,
    [(0.0, 1.5, 0, DH)], C_struct, material=M_wall)

# Living/Kitchen divider (x=6.8, y=0→4.2)
wall_with_openings("IW_LivKit", 6.8, 0, 6.8, 4.2,
    [(0.60, 1.20, 0.85, 2.10)],        # Pass-through shelf
    C_struct, material=M_wall)

# Main horizontal divider (y=4.2, x=0→9.4)
wall_with_openings("IW_MidH", 0, 4.2, 9.4, 4.2,
    [(1.50, DW, 0, DH),                # Door to MBR zone
     (4.60, DW, 0, DH),                # Door to BR2 zone
    ], C_struct, material=M_wall)

# MBR/BR2 divider (x=4.2, y=4.2→8.5)
wall_with_openings("IW_BR_Div", 4.2, 4.2, 4.2, 8.5,
    [], C_struct, material=M_wall)

# Master bath south wall (y=7.0, x=0→2.0)
wall_with_openings("IW_MBath_S", 0, 7.0, 2.0, 7.0,
    [(0.20, DW, 0, DH)], C_struct, material=M_wall)

# Master bath east wall (x=2.0, y=7.0→8.5)
wall_with_openings("IW_MBath_E", 2.0, 7.0, 2.0, 8.5,
    [], C_struct, material=M_wall)

# Common bath west wall (x=8.0, y=4.2→7.2)
wall_with_openings("IW_CBath_W", 8.0, 4.2, 8.0, 7.2,
    [(0.40, DW, 0, DH)], C_struct, material=M_wall)

# Common bath north wall (y=7.2, x=8.0→9.4)
wall_with_openings("IW_CBath_N", 8.0, 7.2, 9.4, 7.2,
    [], C_struct, material=M_wall)

# Balcony divider (y=3.0, x=6.8→9.4) – sliding door
wall_with_openings("IW_Balcony", 6.8, 3.0, 9.4, 3.0,
    [(0.30, 1.60, 0, SDH)], C_struct, material=M_wall)

# ── SKIRTING & CORNICES ──────────────────────────────────────────────────────
for seg in [
    ("Sk_Liv_S",  1.5,0,   6.8,0),   ("Sk_Liv_N",  1.5,4.2, 6.8,4.2),
    ("Sk_Liv_W",  0,  0,   0,  4.2),  ("Sk_Kit_W",  6.8,0,   6.8,3.0),
    ("Sk_MBR_S",  0,  4.2, 4.2,4.2),  ("Sk_MBR_N",  0,  8.5, 4.2,8.5),
    ("Sk_MBR_W",  0,  4.2, 0,  7.0),  ("Sk_BR2_S",  4.2,4.2, 8.0,4.2),
    ("Sk_BR2_N",  4.2,8.5, 8.0,8.5),  ("Sk_BR2_E",  8.0,4.2, 8.0,7.2),
]:
    skirting_rect(*seg, C_struct)

# ── WINDOWS (all openings) ───────────────────────────────────────────────────
window_frame("Win_Liv1",  2.10, -WT-0.01,   WSH, WW, WWH, 0,         C_open)
window_frame("Win_Liv2",  3.70, -WT-0.01,   WSH, WW, WWH, 0,         C_open)
window_frame("Win_Kit_S", 7.10, -WT-0.01,   WSH, WW, WWH, 0,         C_open)
window_frame("Win_MBR_N", 0.90, 8.5+WT+0.01,WSH, WW, WWH, math.pi,   C_open)
window_frame("Win_BR2_N", 5.00, 8.5+WT+0.01,WSH, WW, WWH, math.pi,   C_open)
window_frame("Win_MBR_W",-WT-0.01, 4.2+5.40, WSH, WW, WWH,-math.pi/2,C_open)
window_frame("Win_Kit_E", 9.4+WT+0.01, 0.50, WSH, WW, WWH, math.pi/2, C_open)
window_frame("Win_CBath", 9.4+WT+0.01, 4.50, 1.60, 0.60, 0.60, math.pi/2, C_open)

# ── DOORS ────────────────────────────────────────────────────────────────────
door_frame("Dr_Entry",  0.50, -WT,   0, DW, DH, 0,        C_open)
door_frame("Dr_MBR",    1.50, 4.2,   0, DW, DH, 0,        C_open)
door_frame("Dr_BR2",    4.60, 4.2,   0, DW, DH, 0,        C_open)
door_frame("Dr_MBath",  0.20, 7.0,   0, DW, DH, 0,        C_open)
door_frame("Dr_CBath",  8.0,  4.60,  0, DW, DH, math.pi/2,C_open)

# ── BALCONY RAILING ──────────────────────────────────────────────────────────
rh = 1.05; rp = 0.12; rt = 0.04
# Glass balustrade panel
box("Bal_Rail_Glass", (6.8, 2.95, 0), (2.6, 0.04, rh), C_struct, M_glass)
# Top handrail
rounded_box("Bal_Handrail", (6.75, 2.92, rh), (2.65, 0.08, rt), 0.01, C_struct, M_railing)
# Vertical posts every 0.6m
for pi2 in range(5):
    cx = 6.8 + pi2 * 0.60
    cylinder(f"Bal_Post{pi2}", (cx, 2.97, 0), 0.025, rh+rt, 8, C_struct, M_railing)

# ══════════════════════════════════════════════════════════════════════════════
# FURNISH ROOMS
# ══════════════════════════════════════════════════════════════════════════════
print("Furnishing rooms…")

# ── LIVING ROOM ──────────────────────────────────────────────────────────────
make_sofa_l((1.7, 0.30, 0), C_living)
make_coffee_table((2.50, 1.60, 0), C_living)
make_tv_unit((1.8, 3.70, 0), (2.80, 0.45, 0.55), C_living)
make_carpet((2.0, 0.50, 0), (3.5, 2.8), (0.55, 0.42, 0.32), C_living)
make_indoor_plant("Plant_Liv1", (1.65, 3.60, 0), C_living)
make_indoor_plant("Plant_Liv2", (6.60, 0.40, 0), C_living)

# ── DINING ───────────────────────────────────────────────────────────────────
make_dining_set((4.40, 0.30, 0), C_dining)

# ── KITCHEN ──────────────────────────────────────────────────────────────────
make_kitchen((7.0, 0.23, 0), C_kit)

# ── MASTER BEDROOM ───────────────────────────────────────────────────────────
make_king_bed((0.22, 4.50, 0), C_mbr)
make_wardrobe((0.10, 4.25, 0), (1.80, 0.60, 2.20), C_mbr)
# Curtains (flat panels beside windows)
M_curtain = mat_plain("Curtain_MBR", (0.88,0.82,0.75), 0.92)
box("Curt_MBR_L", (-WT,8.22,0), (0.30, 0.08, 2.50), C_mbr, M_curtain)
box("Curt_MBR_R", (-WT,8.70,0), (0.30, 0.08, 2.50), C_mbr, M_curtain)

# ── MASTER BATH ──────────────────────────────────────────────────────────────
make_bathroom((0.08, 7.08, 0), (1.84, 1.42), is_master=True, collection=C_bath)

# ── BEDROOM 2 ────────────────────────────────────────────────────────────────
make_queen_bed((4.35, 5.60, 0), C_br2)
make_wardrobe((4.30, 4.25, 0), (1.60, 0.58, 2.20), C_br2)
make_study_desk((6.40, 4.35, 0), C_br2)
M_curtain2 = mat_plain("Curtain_BR2", (0.80,0.85,0.90), 0.92)
box("Curt_BR2_L", (4.82,8.50,0), (0.08,0.30,2.50), C_br2, M_curtain2)
box("Curt_BR2_R", (5.40,8.50,0), (0.08,0.30,2.50), C_br2, M_curtain2)

# ── COMMON BATH ──────────────────────────────────────────────────────────────
make_bathroom((8.08, 4.28, 0), (1.32, 2.90), is_master=False, collection=C_bath)

# ── BALCONY ──────────────────────────────────────────────────────────────────
make_balcony_furniture((6.82, 3.05, 0), C_bal)

# ══════════════════════════════════════════════════════════════════════════════
# CEILING DOWNLIGHTS
# ══════════════════════════════════════════════════════════════════════════════
for lname,lx,ly in [
    ("DL_Foyer",  0.75, 0.90),
    ("DL_Liv1",   3.00, 1.50), ("DL_Liv2",  5.00, 1.50),
    ("DL_Liv3",   3.00, 3.00), ("DL_Liv4",  5.00, 3.00),
    ("DL_Kit1",   7.60, 1.20), ("DL_Kit2",  8.80, 1.20),
    ("DL_MBR1",   1.50, 5.50), ("DL_MBR2",  3.00, 6.50),
    ("DL_BR2_1",  5.50, 5.80), ("DL_BR2_2",  7.00, 6.50),
    ("DL_MBath",  0.90, 7.80),
    ("DL_CBath",  8.60, 5.60),
    ("DL_Bal",    8.00, 3.45),
]:
    ceiling_light(lname, lx, ly, C_lights)

# ══════════════════════════════════════════════════════════════════════════════
# SCENE LIGHTING
# ══════════════════════════════════════════════════════════════════════════════
print("Setting up lighting…")

# Sun light (warm afternoon)
bpy.ops.object.light_add(type="SUN", location=(10, -5, 12))
sun = bpy.context.active_object
sun.name = "Sun_Main"
sun.data.energy = 2.5
sun.data.color  = (1.00, 0.95, 0.85)
sun.data.angle  = math.radians(5)
sun.rotation_euler = (math.radians(55), 0, math.radians(-35))
C_lights.objects.link(sun); bpy.context.scene.collection.objects.unlink(sun)

# Fill light (bounce from north)
bpy.ops.object.light_add(type="AREA", location=(4.7, 12, 3))
fill = bpy.context.active_object
fill.name = "Fill_North"
fill.data.energy = 80
fill.data.color  = (0.85, 0.90, 1.00)
fill.data.size   = 6.0
fill.rotation_euler = (math.radians(15), 0, 0)
C_lights.objects.link(fill); bpy.context.scene.collection.objects.unlink(fill)

# Window area lights (simulate sky through glass)
for wname, wx, wy, wz, wrot in [
    ("WAL_S1", 2.70, -1.5, 1.50, (math.pi/2, 0, 0)),
    ("WAL_S2", 4.30, -1.5, 1.50, (math.pi/2, 0, 0)),
    ("WAL_W1",-1.5,  6.50, 1.50, (math.pi/2, 0, math.pi/2)),
]:
    bpy.ops.object.light_add(type="AREA", location=(wx, wy, wz))
    wl = bpy.context.active_object
    wl.name = wname
    wl.data.energy = 120
    wl.data.color  = (0.90, 0.93, 1.00)
    wl.data.size   = 1.0
    wl.rotation_euler = wrot
    C_lights.objects.link(wl); bpy.context.scene.collection.objects.unlink(wl)

# World HDRI (simple sky gradient — replace with real HDRI for renders)
world = bpy.context.scene.world
world.use_nodes = True
wnt   = world.node_tree
wnt.nodes.clear()
bg    = wnt.nodes.new("ShaderNodeBackground")
sky   = wnt.nodes.new("ShaderNodeTexSky")
out   = wnt.nodes.new("ShaderNodeOutputWorld")
sky.sky_type = "PREETHAM"
sky.turbidity = 2.0
bg.inputs["Strength"].default_value = 0.6
wnt.links.new(sky.outputs["Color"], bg.inputs["Color"])
wnt.links.new(bg.outputs["Background"], out.inputs["Surface"])

# ══════════════════════════════════════════════════════════════════════════════
# CAMERAS
# ══════════════════════════════════════════════════════════════════════════════
print("Placing cameras…")

cam_living = add_camera("Cam_Living",
    loc=(1.8, 1.2, 1.6), target=(4.5, 2.5, 1.2), collection=C_cam, lens=24)
cam_kitchen = add_camera("Cam_Kitchen",
    loc=(6.9, 2.5, 1.6), target=(8.5, 1.0, 1.2), collection=C_cam, lens=28)
cam_mbr = add_camera("Cam_MBR",
    loc=(3.5, 5.0, 1.6), target=(0.9, 6.5, 1.0), collection=C_cam, lens=28)
cam_br2 = add_camera("Cam_BR2",
    loc=(7.8, 5.2, 1.6), target=(5.5, 6.5, 1.0), collection=C_cam, lens=28)
cam_bal = add_camera("Cam_Balcony",
    loc=(7.5, 3.4, 1.5), target=(8.0, 3.1, 1.0), collection=C_cam, lens=28)
cam_top = add_camera("Cam_TopView",
    loc=(4.7, 4.25, 14), target=(4.7, 4.25, 0),  collection=C_cam, lens=50)
cam_mbath = add_camera("Cam_MBath",
    loc=(1.8, 7.2, 1.5), target=(0.5, 7.8, 1.0), collection=C_cam, lens=24)

bpy.context.scene.camera = cam_living

# ── Fly-through animation (simple keyframes) ──────────────────────────────
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end   = 210
bpy.context.scene.render.fps  = 30

fly_points = [
    (1,   (0.80, 0.80, 1.6), (4.5, 2.5, 1.2)),
    (40,  (3.00, 1.50, 1.6), (4.5, 2.0, 1.0)),
    (70,  (6.50, 2.50, 1.6), (8.5, 1.0, 1.2)),
    (100, (0.50, 6.50, 1.6), (2.0, 7.0, 1.0)),
    (130, (3.50, 5.00, 1.6), (0.9, 6.5, 1.0)),
    (160, (7.50, 5.50, 1.6), (5.5, 6.5, 1.0)),
    (190, (7.80, 3.40, 1.5), (8.0, 3.1, 1.0)),
    (210, (0.80, 0.80, 1.6), (4.5, 2.5, 1.2)),
]
bpy.ops.object.camera_add(location=fly_points[0][1])
fly_cam = bpy.context.active_object
fly_cam.name = "Cam_FlyThrough"
C_cam.objects.link(fly_cam)
try: bpy.context.scene.collection.objects.unlink(fly_cam)
except: pass
fly_cam.data.lens = 28

for frame, pos, tgt in fly_points:
    bpy.context.scene.frame_set(frame)
    fly_cam.location = pos
    dx,dy,dz = tgt[0]-pos[0], tgt[1]-pos[1], tgt[2]-pos[2]
    pitch = math.atan2(-dz, math.hypot(dx,dy))
    yaw   = math.atan2(dy,dx) - math.pi/2
    fly_cam.rotation_euler = (math.pi/2+pitch, 0, yaw)
    fly_cam.keyframe_insert("location")
    fly_cam.keyframe_insert("rotation_euler")

# Smooth interpolation
for fc in fly_cam.animation_data.action.fcurves:
    for kf in fc.keyframe_points:
        kf.interpolation = "BEZIER"

# ══════════════════════════════════════════════════════════════════════════════
# RENDER SETTINGS
# ══════════════════════════════════════════════════════════════════════════════
scene = bpy.context.scene
scene.render.engine  = "CYCLES"
scene.cycles.samples = 128
scene.cycles.use_denoising = True
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.cycles.device = "GPU"

# ── GLB EXPORT ───────────────────────────────────────────────────────────────
import os
out_path = os.path.join(os.path.dirname(bpy.data.filepath) if bpy.data.filepath
                        else os.path.expanduser("~"), "apartment.glb")

bpy.ops.export_scene.gltf(
    filepath          = out_path,
    export_format     = "GLB",
    export_apply      = True,       # apply all modifiers
    export_draco_mesh_compression_enable = True,
    export_draco_mesh_compression_level  = 6,
    export_image_format = "WEBP",
    export_cameras    = True,
    export_lights     = True,
    export_animations = True,
)

print("=" * 60)
print(f"✓ Export complete: {out_path}")
print(f"  Copy to: public/assets/3d/apartment.glb")
print("=" * 60)
