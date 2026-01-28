# Ember Ascent: Visual Explanations for All Three Styles

## Overview

Every question in Ember Ascent has THREE explanation styles. Each style should have its own visual representation:

| Style | Purpose | Visual Type |
|-------|---------|-------------|
| **Step-by-Step** | Linear walkthrough of the solution | Sequential diagram with numbered steps |
| **Visual/Analogy** | Real-world comparison or pictorial method | Conceptual illustration, analogy image |
| **Worked Example** | Similar question solved completely | Side-by-side comparison diagram |

---

## Image Generation Agent Prompt

```
You are a visual explanation generator for Ember Ascent, a UK 11+ exam preparation platform for children aged 9-11.

Your task: Generate THREE distinct visual explanations for each question - one for each explanation style.

## GLOBAL STYLE REQUIREMENTS

- **Audience**: Children aged 9-11 (Year 5-6)
- **Style**: Clean, simple, educational - NOT cluttered
- **Colors**: 
  - Primary: #3B82F6 (blue)
  - Success: #22C55E (green)  
  - Highlight: #EF4444 (red)
  - Warning: #F59E0B (amber)
  - Neutral: #374151 (gray)
  - Background: #FFFFFF (white)
- **Text**: Clear sans-serif, minimum 14pt
- **Dimensions**: 800x400px (landscape) per image
- **Format**: PNG or SVG

---

## STYLE 1: STEP-BY-STEP VISUAL

**Purpose**: Show the solution as a linear sequence of numbered steps.

**Visual format**: 
- Numbered boxes/circles (1, 2, 3...) connected by arrows
- Each step shows the calculation and result
- Final answer highlighted in green box
- Progress flows left-to-right or top-to-bottom

**Template structure**:
```
┌─────────┐    ┌─────────┐    ┌─────────┐    ╔═════════╗
│  Step 1 │ →  │  Step 2 │ →  │  Step 3 │ →  ║ Answer  ║
│ [calc]  │    │ [calc]  │    │ [calc]  │    ║  [result]║
└─────────┘    └─────────┘    └─────────┘    ╚═════════╝
```

**Input spec**:
```json
{
  "visual_type": "step_by_step",
  "steps": [
    {"number": 1, "text": "Identify: same denominator (35)", "highlight": false},
    {"number": 2, "text": "Add numerators: 17 + 23 = 40", "highlight": false},
    {"number": 3, "text": "Keep denominator: 40/35", "highlight": false},
    {"number": 4, "text": "Convert: 40 ÷ 35 = 1 r 5", "highlight": false},
    {"number": 5, "text": "Answer: 1 5/35", "highlight": true, "is_answer": true}
  ],
  "flow_direction": "horizontal",
  "show_arrows": true
}
```

---

## STYLE 2: VISUAL/ANALOGY

**Purpose**: Connect the maths concept to a real-world situation or visual representation.

**Visual formats by topic**:

### Fractions → Pizza/Chocolate Bar
```json
{
  "visual_type": "analogy",
  "analogy_theme": "pizza",
  "spec": {
    "total_slices": 35,
    "group_1": {"slices": 17, "color": "#3B82F6", "label": "You have"},
    "group_2": {"slices": 23, "color": "#22C55E", "label": "You get"},
    "result": {"total": 40, "whole_pizzas": 1, "extra_slices": 5},
    "caption": "17 slices + 23 slices = 40 slices = 1 whole pizza + 5 extra"
  }
}
```

### Number Operations → Number Line Journey
```json
{
  "visual_type": "analogy",
  "analogy_theme": "journey",
  "spec": {
    "start_position": -4,
    "movements": [
      {"direction": "right", "amount": 9, "label": "Walk 9 steps right"}
    ],
    "end_position": 5,
    "landmarks": [
      {"position": 0, "label": "Home (zero)", "icon": "house"}
    ],
    "caption": "Starting at -4, walking 9 steps right takes you to 5"
  }
}
```

### Geometry → Real Objects
```json
{
  "visual_type": "analogy",
  "analogy_theme": "real_objects",
  "spec": {
    "concept": "angles_in_triangle",
    "objects": [
      {"type": "triangle_corners", "description": "Tear off the 3 corners of a triangle"},
      {"type": "straight_line", "description": "Arrange them to form a straight line (180°)"}
    ],
    "caption": "The three corners of any triangle always make a straight line"
  }
}
```

### Percentages → Money/Shopping
```json
{
  "visual_type": "analogy",
  "analogy_theme": "shopping",
  "spec": {
    "original_price": 80,
    "discount_percent": 25,
    "calculation_visual": {
      "show_100_grid": true,
      "shade_percent": 25,
      "money_equivalent": "£20 off"
    },
    "caption": "25% off £80 = £20 discount = Pay £60"
  }
}
```

### Ratio → Sharing Sweets
```json
{
  "visual_type": "analogy",
  "analogy_theme": "sharing",
  "spec": {
    "total_items": 20,
    "item_type": "sweets",
    "ratio": [2, 3],
    "recipients": ["Tom", "Sarah"],
    "distribution_visual": {
      "show_groups": true,
      "group_size": 5,
      "num_groups": 4
    },
    "caption": "20 sweets shared 2:3 = Tom gets 8, Sarah gets 12"
  }
}
```

---

## STYLE 3: WORKED EXAMPLE

**Purpose**: Show a similar but different question solved completely, side-by-side with the original.

**Visual format**:
- Two-column layout
- Left: "Similar Example" (fully solved)
- Right: "Your Question" (showing parallel steps)
- Matching steps aligned horizontally
- Different numbers but same method

**Template structure**:
```
╔══════════════════════════════════════════════════════════════╗
║  SIMILAR EXAMPLE          ║    YOUR QUESTION                 ║
╠══════════════════════════════════════════════════════════════╣
║  Calculate 11/20 + 7/20   ║    Calculate 17/35 + 23/35       ║
╠═══════════════════════════╬══════════════════════════════════╣
║  Step 1: Same denominator ║    Step 1: Same denominator      ║
║          (20) ✓           ║            (35) ✓                ║
╠═══════════════════════════╬══════════════════════════════════╣
║  Step 2: Add numerators   ║    Step 2: Add numerators        ║
║          11 + 7 = 18      ║            17 + 23 = 40          ║
╠═══════════════════════════╬══════════════════════════════════╣
║  Step 3: Result           ║    Step 3: Result                ║
║          18/20            ║            40/35                 ║
╠═══════════════════════════╬══════════════════════════════════╣
║  Step 4: Simplify         ║    Step 4: Convert to mixed      ║
║          = 9/10           ║            = 1 5/35              ║
╚══════════════════════════════════════════════════════════════╝
```

**Input spec**:
```json
{
  "visual_type": "worked_example",
  "layout": "side_by_side",
  "example_question": {
    "text": "Calculate 11/20 + 7/20",
    "steps": [
      {"step": 1, "description": "Same denominator (20)", "status": "check"},
      {"step": 2, "description": "Add numerators: 11 + 7 = 18", "calculation": "11 + 7 = 18"},
      {"step": 3, "description": "Result: 18/20", "result": "18/20"},
      {"step": 4, "description": "Simplify: 9/10", "result": "9/10", "is_final": true}
    ]
  },
  "your_question": {
    "text": "Calculate 17/35 + 23/35",
    "steps": [
      {"step": 1, "description": "Same denominator (35)", "status": "check"},
      {"step": 2, "description": "Add numerators: 17 + 23 = 40", "calculation": "17 + 23 = 40"},
      {"step": 3, "description": "Result: 40/35", "result": "40/35"},
      {"step": 4, "description": "Convert: 1 5/35", "result": "1 5/35", "is_final": true}
    ]
  },
  "highlight_parallel": true,
  "show_method_match": true
}
```

---

## COMPLETE QUESTION EXAMPLE WITH ALL THREE VISUALS

```json
{
  "question_id": "MATH-FRC-add-S-Y5-001",
  "question_text": "Calculate 17/35 + 23/35. Give your answer as a mixed number.",
  "computed_answer": "1 5/35",
  "correct_option": "d",
  
  "explanations": {
    "step_by_step": {
      "text": "When adding fractions with the same denominator, keep the denominator and add the numerators. 17 + 23 = 40. So we get 40/35. Since 40 > 35, convert to mixed number: 40 ÷ 35 = 1 remainder 5, giving 1 5/35.",
      "visual": {
        "visual_type": "step_by_step",
        "steps": [
          {"number": 1, "text": "Same denominator? Yes (35)", "icon": "check", "highlight": false},
          {"number": 2, "text": "Add numerators: 17 + 23", "calculation": "17 + 23 = 40", "highlight": false},
          {"number": 3, "text": "Write fraction: 40/35", "highlight": false},
          {"number": 4, "text": "40 > 35, so convert", "highlight": false},
          {"number": 5, "text": "40 ÷ 35 = 1 r 5", "calculation": "40 ÷ 35 = 1 remainder 5", "highlight": false},
          {"number": 6, "text": "Answer: 1 5/35", "highlight": true, "is_answer": true, "box_color": "#22C55E"}
        ],
        "flow_direction": "vertical",
        "connector_style": "arrow"
      }
    },
    
    "visual_analogy": {
      "text": "Imagine cutting a pizza into 35 slices. You have 17 slices and get 23 more. That's 40 slices total - more than one whole pizza! One whole pizza is 35 slices, so you have 1 whole pizza plus 5 extra slices.",
      "visual": {
        "visual_type": "analogy",
        "analogy_theme": "pizza",
        "spec": {
          "scene_type": "before_after",
          "before": {
            "pizzas": [
              {"slices_total": 35, "slices_have": 17, "label": "You have 17 slices"}
            ],
            "extra_slices": {"count": 23, "label": "You get 23 more"}
          },
          "after": {
            "whole_pizzas": 1,
            "extra_slices": 5,
            "label": "= 1 whole pizza + 5 slices"
          },
          "equation_overlay": "17/35 + 23/35 = 40/35 = 1 5/35",
          "style": {
            "pizza_color": "#F59E0B",
            "slice_lines": "#374151",
            "highlight_color": "#3B82F6"
          }
        }
      }
    },
    
    "worked_example": {
      "text": "Here's a similar question: 11/20 + 7/20. Same denominator (20), so add numerators: 11 + 7 = 18. Result: 18/20. Your question follows the same method but needs converting to a mixed number since 40 > 35.",
      "visual": {
        "visual_type": "worked_example",
        "layout": "side_by_side",
        "example": {
          "title": "Similar Example",
          "question": "11/20 + 7/20",
          "steps": [
            {"label": "Check denominator", "content": "Same (20) ✓", "color": "#22C55E"},
            {"label": "Add numerators", "content": "11 + 7 = 18", "color": "#3B82F6"},
            {"label": "Write result", "content": "18/20", "color": "#3B82F6"},
            {"label": "Simplify", "content": "= 9/10", "color": "#22C55E", "is_final": true}
          ]
        },
        "current": {
          "title": "Your Question",
          "question": "17/35 + 23/35",
          "steps": [
            {"label": "Check denominator", "content": "Same (35) ✓", "color": "#22C55E"},
            {"label": "Add numerators", "content": "17 + 23 = 40", "color": "#3B82F6"},
            {"label": "Write result", "content": "40/35", "color": "#3B82F6"},
            {"label": "Convert (40>35)", "content": "= 1 5/35", "color": "#22C55E", "is_final": true}
          ]
        },
        "show_arrows_between": true,
        "method_label": "Same method!"
      }
    }
  }
}
```

---

## VISUAL TEMPLATES BY MATHS TOPIC

### FRACTIONS

| Explanation Style | Visual Theme | Key Elements |
|-------------------|--------------|--------------|
| Step-by-step | Calculation flow | Numbered boxes, fraction notation |
| Visual/Analogy | Pizza, chocolate bar, shape | Divided circles/rectangles, shading |
| Worked Example | Side-by-side fractions | Parallel steps, matching structure |

### NUMBER & PLACE VALUE

| Explanation Style | Visual Theme | Key Elements |
|-------------------|--------------|--------------|
| Step-by-step | Place value columns | H-T-O boxes, arrows showing movement |
| Visual/Analogy | Money, base-10 blocks | £100 notes, £10 notes, £1 coins |
| Worked Example | Two numbers compared | Column alignment, digit highlighting |

### GEOMETRY

| Explanation Style | Visual Theme | Key Elements |
|-------------------|--------------|--------------|
| Step-by-step | Shape with annotations | Labeled sides, angles, measurements |
| Visual/Analogy | Real objects, paper folding | Triangle corners → straight line |
| Worked Example | Two shapes side-by-side | Same method, different measurements |

### STATISTICS

| Explanation Style | Visual Theme | Key Elements |
|-------------------|--------------|--------------|
| Step-by-step | Reading chart + calculation | Arrows pointing to values, sum shown |
| Visual/Analogy | Real data context | Classroom survey, sports scores |
| Worked Example | Two similar charts | Same reading method, different data |

### NEGATIVE NUMBERS

| Explanation Style | Visual Theme | Key Elements |
|-------------------|--------------|--------------|
| Step-by-step | Number line with jumps | Numbered steps above line |
| Visual/Analogy | Thermometer, lift/elevator, debt | Temperature scale, floor numbers |
| Worked Example | Two number lines | Same operation, different numbers |

### PERCENTAGES

| Explanation Style | Visual Theme | Key Elements |
|-------------------|--------------|--------------|
| Step-by-step | Calculation chain | 100% → find 10% → find answer |
| Visual/Analogy | Shopping discount, 100-grid | Price tag, shaded squares |
| Worked Example | Two percentage problems | Same method, different amounts |

### RATIO

| Explanation Style | Visual Theme | Key Elements |
|-------------------|--------------|--------------|
| Step-by-step | Grouping + multiplication | Parts identified, multiplied |
| Visual/Analogy | Sharing sweets, mixing paint | Groups of items, color mixing |
| Worked Example | Two ratio problems | Same division method |

### ALGEBRA

| Explanation Style | Visual Theme | Key Elements |
|-------------------|--------------|--------------|
| Step-by-step | Balance/equation solving | Operations on both sides |
| Visual/Analogy | Weighing scales, mystery boxes | Balance with known/unknown |
| Worked Example | Two equations | Same solving technique |

---

## PYTHON GENERATION CODE

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io

class ExplanationVisualGenerator:
    """Generate visuals for all three explanation styles."""
    
    COLORS = {
        'primary': '#3B82F6',
        'success': '#22C55E',
        'highlight': '#EF4444',
        'warning': '#F59E0B',
        'neutral': '#374151',
        'light': '#E5E7EB',
        'white': '#FFFFFF'
    }
    
    def __init__(self, width=800, height=400, dpi=100):
        self.width = width
        self.height = height
        self.dpi = dpi
    
    # ==================== STYLE 1: STEP-BY-STEP ====================
    
    def generate_step_by_step(self, steps: list, flow='horizontal') -> bytes:
        """
        Generate step-by-step visual with numbered boxes and arrows.
        
        Args:
            steps: List of {"number": int, "text": str, "highlight": bool, "is_answer": bool}
            flow: 'horizontal' or 'vertical'
        """
        fig, ax = plt.subplots(figsize=(self.width/self.dpi, self.height/self.dpi), dpi=self.dpi)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 5)
        ax.axis('off')
        
        n_steps = len(steps)
        
        if flow == 'horizontal':
            step_width = 8 / n_steps
            for i, step in enumerate(steps):
                x = 1 + i * step_width
                y = 2.5
                
                # Box color
                if step.get('is_answer'):
                    box_color = self.COLORS['success']
                    text_color = 'white'
                elif step.get('highlight'):
                    box_color = self.COLORS['warning']
                    text_color = 'black'
                else:
                    box_color = self.COLORS['light']
                    text_color = 'black'
                
                # Draw box
                box = FancyBboxPatch((x, y-0.8), step_width-0.3, 1.6,
                                     boxstyle="round,pad=0.05",
                                     facecolor=box_color, edgecolor=self.COLORS['neutral'],
                                     linewidth=2)
                ax.add_patch(box)
                
                # Step number
                circle = plt.Circle((x + 0.3, y + 0.5), 0.25, 
                                   color=self.COLORS['primary'], zorder=5)
                ax.add_patch(circle)
                ax.text(x + 0.3, y + 0.5, str(step['number']), 
                       ha='center', va='center', fontsize=10, color='white', fontweight='bold')
                
                # Step text
                ax.text(x + (step_width-0.3)/2, y, step['text'], 
                       ha='center', va='center', fontsize=9, color=text_color,
                       wrap=True)
                
                # Arrow to next step
                if i < n_steps - 1:
                    ax.annotate('', xy=(x + step_width - 0.1, y),
                               xytext=(x + step_width - 0.4, y),
                               arrowprops=dict(arrowstyle='->', color=self.COLORS['neutral'], lw=2))
        
        else:  # vertical
            step_height = 4 / n_steps
            for i, step in enumerate(steps):
                x = 5
                y = 4 - i * step_height
                
                box_color = self.COLORS['success'] if step.get('is_answer') else self.COLORS['light']
                text_color = 'white' if step.get('is_answer') else 'black'
                
                box = FancyBboxPatch((1, y-0.4), 8, 0.8,
                                     boxstyle="round,pad=0.05",
                                     facecolor=box_color, edgecolor=self.COLORS['neutral'],
                                     linewidth=2)
                ax.add_patch(box)
                
                ax.text(1.5, y, f"{step['number']}.", fontsize=11, fontweight='bold', 
                       color=self.COLORS['primary'], va='center')
                ax.text(2, y, step['text'], fontsize=10, color=text_color, va='center')
                
                if i < n_steps - 1:
                    ax.annotate('', xy=(5, y - 0.6), xytext=(5, y - 0.4),
                               arrowprops=dict(arrowstyle='->', color=self.COLORS['neutral'], lw=2))
        
        return self._fig_to_bytes(fig)
    
    # ==================== STYLE 2: VISUAL/ANALOGY ====================
    
    def generate_pizza_analogy(self, total_slices: int, have: int, get: int) -> bytes:
        """Generate pizza fraction analogy."""
        fig, axes = plt.subplots(1, 3, figsize=(self.width/self.dpi, self.height/self.dpi), dpi=self.dpi)
        
        def draw_pizza(ax, total, filled, label, title):
            ax.set_xlim(-1.5, 1.5)
            ax.set_ylim(-1.5, 1.5)
            ax.set_aspect('equal')
            ax.axis('off')
            ax.set_title(title, fontsize=12, fontweight='bold')
            
            # Draw slices
            for i in range(total):
                angle_start = i * 360 / total
                angle_end = (i + 1) * 360 / total
                color = self.COLORS['primary'] if i < filled else self.COLORS['light']
                wedge = patches.Wedge((0, 0), 1, angle_start, angle_end,
                                      facecolor=color, edgecolor=self.COLORS['neutral'], linewidth=1)
                ax.add_patch(wedge)
            
            ax.text(0, -1.3, label, ha='center', fontsize=10)
        
        total = have + get
        whole_pizzas = total // total_slices
        extra = total % total_slices
        
        draw_pizza(axes[0], total_slices, have, f"{have}/{total_slices}", "You have")
        draw_pizza(axes[1], total_slices, get, f"+{get}/{total_slices}", "You get")
        
        # Result
        axes[2].set_xlim(-1.5, 1.5)
        axes[2].set_ylim(-1.5, 1.5)
        axes[2].axis('off')
        axes[2].set_title("Result", fontsize=12, fontweight='bold')
        
        if whole_pizzas >= 1:
            # Show whole pizza + extra
            circle = plt.Circle((0, 0.3), 0.6, color=self.COLORS['success'], ec=self.COLORS['neutral'])
            axes[2].add_patch(circle)
            axes[2].text(0, 0.3, f"{whole_pizzas}", ha='center', va='center', fontsize=20, color='white', fontweight='bold')
            axes[2].text(0, -0.5, f"+ {extra}/{total_slices}", ha='center', fontsize=12)
            axes[2].text(0, -1, f"= {whole_pizzas} {extra}/{total_slices}", ha='center', fontsize=11, 
                        color=self.COLORS['success'], fontweight='bold')
        
        plt.tight_layout()
        return self._fig_to_bytes(fig)
    
    def generate_number_line_journey(self, min_val: int, max_val: int, 
                                      start: int, end: int, label: str,
                                      theme: str = 'temperature') -> bytes:
        """Generate number line with journey/thermometer analogy."""
        fig, ax = plt.subplots(figsize=(self.width/self.dpi, self.height/self.dpi), dpi=self.dpi)
        
        ax.set_xlim(min_val - 1, max_val + 1)
        ax.set_ylim(-1, 3)
        ax.axis('off')
        
        # Title
        if theme == 'temperature':
            ax.set_title('Temperature Change', fontsize=14, fontweight='bold')
        else:
            ax.set_title('Number Line Journey', fontsize=14, fontweight='bold')
        
        # Draw line
        ax.plot([min_val, max_val], [0, 0], 'k-', linewidth=3)
        
        # Tick marks
        for i in range(min_val, max_val + 1):
            tick_height = 0.2 if i != 0 else 0.35
            ax.plot([i, i], [-tick_height, tick_height], 'k-', linewidth=2)
            
            # Labels
            fontweight = 'bold' if i == 0 else 'normal'
            color = self.COLORS['neutral'] if i != 0 else 'black'
            ax.text(i, -0.5, str(i) + ('°C' if theme == 'temperature' else ''), 
                   ha='center', fontsize=10, fontweight=fontweight, color=color)
            
            # Zero marker
            if i == 0:
                ax.plot([i], [0], 'ko', markersize=10)
        
        # Start marker
        ax.plot(start, 0, 'o', color=self.COLORS['highlight'], markersize=15, zorder=5)
        ax.text(start, 0.7, 'Start', ha='center', fontsize=9, color=self.COLORS['highlight'])
        
        # End marker  
        ax.plot(end, 0, 'o', color=self.COLORS['success'], markersize=15, zorder=5)
        ax.text(end, 0.7, 'End', ha='center', fontsize=9, color=self.COLORS['success'])
        
        # Arc
        arc_x = np.linspace(start, end, 50)
        arc_height = 1.5
        arc_y = arc_height * np.sin(np.pi * (arc_x - start) / (end - start))
        ax.plot(arc_x, arc_y, '-', color=self.COLORS['primary'], linewidth=3)
        
        # Arrow head
        ax.annotate('', xy=(end, 0.1), xytext=(end - 0.5 * np.sign(end-start), arc_height * 0.3),
                   arrowprops=dict(arrowstyle='->', color=self.COLORS['primary'], lw=2))
        
        # Label
        mid = (start + end) / 2
        ax.text(mid, arc_height + 0.3, label, ha='center', fontsize=14, 
               fontweight='bold', color=self.COLORS['primary'],
               bbox=dict(boxstyle='round', facecolor='white', edgecolor=self.COLORS['primary']))
        
        return self._fig_to_bytes(fig)
    
    def generate_triangle_analogy(self) -> bytes:
        """Generate the 'tear corners to make straight line' analogy for triangle angles."""
        fig, axes = plt.subplots(1, 3, figsize=(self.width/self.dpi, self.height/self.dpi), dpi=self.dpi)
        
        # Panel 1: Triangle with marked corners
        ax1 = axes[0]
        ax1.set_xlim(0, 4)
        ax1.set_ylim(0, 4)
        ax1.axis('off')
        ax1.set_title('1. Triangle with 3 angles', fontsize=11)
        
        triangle = plt.Polygon([(2, 3.5), (0.5, 0.5), (3.5, 0.5)], 
                               fill=False, edgecolor=self.COLORS['neutral'], linewidth=2)
        ax1.add_patch(triangle)
        
        # Angle markers
        colors = [self.COLORS['highlight'], self.COLORS['primary'], self.COLORS['success']]
        positions = [(2, 3.2), (0.8, 0.8), (3.2, 0.8)]
        labels = ['A', 'B', 'C']
        for pos, color, label in zip(positions, colors, labels):
            ax1.plot(*pos, 'o', color=color, markersize=20)
            ax1.text(*pos, label, ha='center', va='center', color='white', fontweight='bold')
        
        # Panel 2: Torn corners
        ax2 = axes[1]
        ax2.set_xlim(0, 4)
        ax2.set_ylim(0, 4)
        ax2.axis('off')
        ax2.set_title('2. Tear off the corners', fontsize=11)
        
        # Scattered corners
        corner_positions = [(1, 2), (2, 1.5), (3, 2.5)]
        for pos, color, label in zip(corner_positions, colors, labels):
            wedge = patches.Wedge(pos, 0.4, 0, 90, facecolor=color, edgecolor=self.COLORS['neutral'])
            ax2.add_patch(wedge)
            ax2.text(pos[0], pos[1] - 0.6, label, ha='center', fontsize=10, color=color)
        
        ax2.annotate('', xy=(3.5, 2), xytext=(2.5, 2),
                    arrowprops=dict(arrowstyle='->', color=self.COLORS['neutral'], lw=2))
        
        # Panel 3: Straight line
        ax3 = axes[2]
        ax3.set_xlim(0, 4)
        ax3.set_ylim(0, 4)
        ax3.axis('off')
        ax3.set_title('3. They make a straight line!', fontsize=11)
        
        # Straight line with three angles
        ax3.plot([0.5, 3.5], [2, 2], '-', color=self.COLORS['neutral'], linewidth=3)
        
        wedge_angles = [(0, 60), (60, 130), (130, 180)]
        x_positions = [1.2, 2, 2.8]
        for (start, end), x, color, label in zip(wedge_angles, x_positions, colors, labels):
            wedge = patches.Wedge((x, 2), 0.5, start, end, facecolor=color, 
                                  edgecolor=self.COLORS['neutral'], linewidth=1)
            ax3.add_patch(wedge)
        
        ax3.text(2, 0.8, 'A + B + C = 180°', ha='center', fontsize=14, 
                fontweight='bold', color=self.COLORS['success'],
                bbox=dict(boxstyle='round', facecolor='#ECFDF5', edgecolor=self.COLORS['success']))
        
        plt.tight_layout()
        return self._fig_to_bytes(fig)
    
    # ==================== STYLE 3: WORKED EXAMPLE ====================
    
    def generate_worked_example(self, example: dict, current: dict) -> bytes:
        """
        Generate side-by-side worked example comparison.
        
        Args:
            example: {"title": str, "question": str, "steps": [{"label": str, "content": str}]}
            current: {"title": str, "question": str, "steps": [{"label": str, "content": str}]}
        """
        fig, ax = plt.subplots(figsize=(self.width/self.dpi, self.height/self.dpi), dpi=self.dpi)
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 6)
        ax.axis('off')
        
        # Left panel (example)
        left_box = FancyBboxPatch((0.2, 0.3), 4.5, 5.4, boxstyle="round,pad=0.05",
                                   facecolor='#EFF6FF', edgecolor=self.COLORS['primary'], linewidth=2)
        ax.add_patch(left_box)
        
        # Right panel (current)
        right_box = FancyBboxPatch((5.3, 0.3), 4.5, 5.4, boxstyle="round,pad=0.05",
                                    facecolor='#F0FDF4', edgecolor=self.COLORS['success'], linewidth=2)
        ax.add_patch(right_box)
        
        # Titles
        ax.text(2.45, 5.3, example['title'], ha='center', fontsize=12, fontweight='bold',
               color=self.COLORS['primary'])
        ax.text(7.55, 5.3, current['title'], ha='center', fontsize=12, fontweight='bold',
               color=self.COLORS['success'])
        
        # Questions
        ax.text(2.45, 4.8, example['question'], ha='center', fontsize=10,
               bbox=dict(boxstyle='round', facecolor='white', edgecolor=self.COLORS['light']))
        ax.text(7.55, 4.8, current['question'], ha='center', fontsize=10,
               bbox=dict(boxstyle='round', facecolor='white', edgecolor=self.COLORS['light']))
        
        # Steps
        n_steps = len(example['steps'])
        step_height = 3.5 / n_steps
        
        for i, (ex_step, cur_step) in enumerate(zip(example['steps'], current['steps'])):
            y = 4.2 - (i + 1) * step_height
            
            # Example step
            ax.text(0.5, y + 0.2, ex_step['label'], fontsize=8, color=self.COLORS['neutral'])
            ax.text(0.5, y - 0.1, ex_step['content'], fontsize=10, fontweight='bold',
                   color=self.COLORS['primary'] if not ex_step.get('is_final') else self.COLORS['success'])
            
            # Current step  
            ax.text(5.6, y + 0.2, cur_step['label'], fontsize=8, color=self.COLORS['neutral'])
            ax.text(5.6, y - 0.1, cur_step['content'], fontsize=10, fontweight='bold',
                   color=self.COLORS['success'] if cur_step.get('is_final') else self.COLORS['primary'])
            
            # Connecting arrow
            ax.annotate('', xy=(5.2, y), xytext=(4.8, y),
                       arrowprops=dict(arrowstyle='<->', color=self.COLORS['warning'], lw=1.5))
        
        # "Same method" label
        ax.text(5, 0.1, '↔ Same method!', ha='center', fontsize=10, 
               color=self.COLORS['warning'], fontweight='bold')
        
        return self._fig_to_bytes(fig)
    
    # ==================== UTILITY ====================
    
    def _fig_to_bytes(self, fig) -> bytes:
        """Convert matplotlib figure to PNG bytes."""
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', 
                   facecolor='white', edgecolor='none', dpi=self.dpi)
        plt.close(fig)
        buf.seek(0)
        return buf.getvalue()


# ==================== USAGE EXAMPLE ====================

if __name__ == "__main__":
    generator = ExplanationVisualGenerator()
    
    # Example: Fraction addition question
    
    # 1. Step-by-step visual
    steps = [
        {"number": 1, "text": "Same denominator? ✓", "highlight": False},
        {"number": 2, "text": "Add: 17 + 23 = 40", "highlight": False},
        {"number": 3, "text": "Result: 40/35", "highlight": False},
        {"number": 4, "text": "Convert: 1 r 5", "highlight": False},
        {"number": 5, "text": "Answer: 1 5/35", "highlight": True, "is_answer": True}
    ]
    img = generator.generate_step_by_step(steps, flow='horizontal')
    with open("explanation_step_by_step.png", "wb") as f:
        f.write(img)
    
    # 2. Visual analogy (pizza)
    img = generator.generate_pizza_analogy(total_slices=35, have=17, get=23)
    with open("explanation_visual_analogy.png", "wb") as f:
        f.write(img)
    
    # 3. Worked example
    example = {
        "title": "Similar Example",
        "question": "11/20 + 7/20",
        "steps": [
            {"label": "Check", "content": "Same denominator ✓"},
            {"label": "Add", "content": "11 + 7 = 18"},
            {"label": "Result", "content": "18/20"},
            {"label": "Simplify", "content": "= 9/10", "is_final": True}
        ]
    }
    current = {
        "title": "Your Question",
        "question": "17/35 + 23/35",
        "steps": [
            {"label": "Check", "content": "Same denominator ✓"},
            {"label": "Add", "content": "17 + 23 = 40"},
            {"label": "Result", "content": "40/35"},
            {"label": "Convert", "content": "= 1 5/35", "is_final": True}
        ]
    }
    img = generator.generate_worked_example(example, current)
    with open("explanation_worked_example.png", "wb") as f:
        f.write(img)
    
    print("Generated all three explanation visuals!")
```

---

## DATABASE SCHEMA UPDATE

```sql
-- Add visual specifications for all three explanation styles
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation_visuals JSONB;

-- Example structure:
/*
{
  "step_by_step_visual": {
    "visual_type": "step_by_step",
    "steps": [...],
    "image_url": "https://cdn.../step_by_step_001.png",
    "alt_text": "..."
  },
  "analogy_visual": {
    "visual_type": "analogy",
    "analogy_theme": "pizza",
    "spec": {...},
    "image_url": "https://cdn.../analogy_001.png",
    "alt_text": "..."
  },
  "worked_example_visual": {
    "visual_type": "worked_example",
    "example": {...},
    "current": {...},
    "image_url": "https://cdn.../worked_example_001.png",
    "alt_text": "..."
  }
}
*/
```

---

## STORAGE ESTIMATES

| Component | Per Question | 10,000 Questions |
|-----------|--------------|------------------|
| Visual specs (JSON) | ~2 KB | ~20 MB |
| Step-by-step PNG | ~30 KB | ~300 MB |
| Analogy PNG | ~50 KB | ~500 MB |
| Worked example PNG | ~40 KB | ~400 MB |
| **Total** | ~122 KB | **~1.2 GB** |

**Recommendation**: Generate PNGs on-demand or pre-generate for high-traffic questions only. Store specs always, generate images as needed.
