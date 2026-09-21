window.COURSE_DATA = {
  1: {
    short: "Foundations",
    title: "Computer Vision Foundations",
    summary: "Understand what computer vision tries to infer, why pixels are not meaning, and how real systems connect visual input to decisions.",
    image: "assets/ln1.png",
    objectives: [
      "Explain the semantic gap between pixel measurements and scene meaning.",
      "Recognize viewpoint, illumination, occlusion, clutter, and intraclass variation.",
      "Map a practical application into input, processing, output, and decision stages.",
      "Distinguish recognition, reconstruction, generation, and vision-language tasks."
    ],
    concepts: [
      ["The semantic gap", "A camera measures intensities. A useful system must connect those values to objects, relationships, events, and actions."],
      ["Appearance variation", "The same object can produce very different images when viewpoint, lighting, scale, pose, or occlusion changes."],
      ["Task and output", "A vision problem becomes concrete only when its required output is specified: a label, box, mask, trajectory, geometry, or generated image."],
      ["Robustness", "High benchmark accuracy does not guarantee reliable behavior for unusual scenes, rare arrangements, or shifted data."],
      ["Modern progress", "Learning algorithms, large datasets, GPUs, reusable models, and open tools jointly accelerated computer vision."],
      ["System interpretation", "A complete solution includes sensing, preprocessing, inference, postprocessing, and a decision or action."],
    ],
    handsOn: [
      ["Observe", "Choose one everyday scene and list what a human understands immediately."],
      ["Measure", "Describe what the camera actually records: pixels, channels, resolution, and time."],
      ["Specify", "Choose the exact machine output needed for one useful decision."],
      ["Stress-test", "Change viewpoint, lighting, clutter, or occlusion and predict the failure mode."],
    ],
    notebooks: [
      ["Image basics and first pipeline", "Grayscale conversion, brightness, thresholding, and result interpretation.", "LN1_Image_Basics.ipynb"],
    ],
    mcqs: [
      {q:"What does the semantic gap describe?", options:["The distance between two cameras","The difference between pixels and high-level meaning","The difference between image width and height","The delay between video frames"], answer:1, why:"Pixels are measurements; semantics are the objects, relationships, and events inferred from them."},
      {q:"A chair looks very different after the camera moves around it. Which challenge is dominant?", options:["Quantization","Viewpoint variation","Binary thresholding","Compression"], answer:1, why:"Camera pose changes the projected appearance while object identity stays the same."},
      {q:"Which output best describes object detection?", options:["One label for the full image","A class and location for each object","A caption only","A camera focal length"], answer:1, why:"Detection combines category predictions with spatial locations, usually bounding boxes."},
      {q:"A pedestrian is partly hidden by a parked car. This is an example of:", options:["Occlusion","Sampling","Magnification","Color constancy"], answer:0, why:"Occlusion removes visible evidence by hiding part of the target."},
      {q:"Which stage normally follows the main algorithm in a practical pipeline?", options:["Input acquisition","Postprocessing","Sensor manufacture","Dataset licensing"], answer:1, why:"Postprocessing refines raw predictions before a final decision or action."}
    ],
    trueFalse: [
      {q:"Computer vision includes tasks beyond naming objects, such as matching, action understanding, reconstruction, and image generation.",answer:true,why:"Computer vision includes recognition, matching, actions, reconstruction, editing, and generation."},
      {q:"Viewpoint variation can change many pixels even when the physical object remains unchanged.",answer:true,why:"Changing camera pose changes the object's image projection."},
      {q:"Intraclass variation means that all examples within a category look nearly identical.",answer:false,why:"Intraclass variation describes appearance differences within the same category."},
      {q:"Background clutter can make object recognition more difficult.",answer:true,why:"Clutter makes the target harder to separate from surrounding visual patterns."},
      {q:"Occlusion occurs when part of an object is hidden from the camera.",answer:true,why:"Occlusion removes visible evidence needed for recognition or localization."},
      {q:"The semantic gap refers to the difference between pixel-level data and high-level meaning.",answer:true,why:"Computer vision attempts to bridge this representational gap."},
      {q:"Recent advances in computer vision resulted only from faster cameras.",answer:false,why:"Learning methods, GPUs, large datasets, frameworks, and reusable models also contributed."},
      {q:"Super-resolution attempts to recover or synthesize a higher-resolution image from a lower-resolution input.",answer:true,why:"Super-resolution is an image restoration and enhancement task."},
      {q:"Strong benchmark performance proves that a vision system will understand every unusual real-world scene.",answer:false,why:"Unusual contexts can expose failures that standard benchmarks do not measure."},
      {q:"Autonomous vehicles, robotics, and augmented reality are applications of computer vision.",answer:true,why:"Each uses visual data to support actions or interaction."}
    ],
    problemTypes: [["p01","1. From pixels to a vision decision"],["p04","4. Choose the required output"]]
  },
  2: {
    short: "Digital Images",
    title: "Images, Perception, and Vision Tasks",
    summary: "Treat an image as sampled, quantized data and connect image representations to classification, detection, segmentation, and tracking outputs.",
    image: "assets/ln2.jpg",
    objectives: [
      "Calculate intensity levels and uncompressed image storage.",
      "Interpret grayscale, binary, RGB, and video array shapes.",
      "Distinguish sampling from quantization.",
      "Match classification, localization, detection, segmentation, and tracking to their outputs."
    ],
    concepts: [
      ["Sampling", "Sampling chooses discrete spatial locations. More samples increase spatial resolution but also increase storage and computation."],
      ["Quantization", "Quantization maps measured intensity to a finite set of values. An unsigned 8-bit channel has 256 possible levels."],
      ["Color representation", "An RGB image stores three values per pixel. OpenCV normally loads them in BGR channel order."],
      ["Video", "A video adds a time dimension: a sequence of image frames from which motion and actions can be inferred."],
      ["Task hierarchy", "Classification labels an image; localization adds one location; detection finds instances; segmentation labels pixels; tracking links observations over time."],
      ["Hybrid pipelines", "Classical operations and learned models often coexist: normalize first, infer with a network, then clean or track predictions."],
    ],
    handsOn: [
      ["Inspect", "Print shape, dtype, minimum, maximum, and channel order for an image."],
      ["Transform", "Convert RGB to grayscale and compare what information is removed."],
      ["Threshold", "Apply two thresholds and measure how the foreground count changes."],
      ["Interpret", "Choose which task output would support a real decision."],
    ],
    notebooks: [["Image basics and thresholding", "A shared LN1-LN2 notebook for arrays, grayscale, brightness, and binary images.", "LN1_Image_Basics.ipynb"]],
    mcqs: [
      {q:"How many values can an unsigned 8-bit channel represent?", options:["8","16","255","256"], answer:3, why:"Eight bits represent 2^8 = 256 values, numbered 0 through 255."},
      {q:"Which operation discretizes spatial position?", options:["Sampling","Quantization","Classification","Tracking"], answer:0, why:"Sampling selects discrete locations; quantization discretizes the measured values."},
      {q:"What is the shape of a standard height H, width W RGB array?", options:["(3,H,W) only","(H,W,3)","(H,W)","(W,3)"], answer:1, why:"The common image-array layout stores height, width, then three channels."},
      {q:"Which task assigns a class to every pixel?", options:["Classification","Localization","Semantic segmentation","Tracking"], answer:2, why:"Semantic segmentation produces a dense pixel-level label map."},
      {q:"Tracking differs from detection because tracking must:", options:["Use grayscale only","Preserve identity across frames","Always estimate depth","Remove all background pixels"], answer:1, why:"Tracking associates observations over time to maintain object identities and trajectories."}
    ],
    trueFalse: [
      {q:"An unsigned 8-bit grayscale image can represent 256 intensity levels.",answer:true,why:"Eight bits encode values from 0 through 255."},
      {q:"A 1-bit image is a binary image with two possible values.",answer:true,why:"One bit represents two states, commonly 0 and 1."},
      {q:"A standard RGB image contains separate red, green, and blue channels.",answer:true,why:"Each RGB pixel stores three channel values."},
      {q:"Rods are the primary retinal cells for detailed color discrimination.",answer:false,why:"Cones support color vision; rods mainly support brightness and low-light vision."},
      {q:"A real vision system may combine classical processing and deep learning in one pipeline.",answer:true,why:"Hybrid systems often use classical preprocessing, learned inference, and postprocessing."},
      {q:"Preprocessing always occurs after the final decision in a computer vision pipeline.",answer:false,why:"Preprocessing prepares the input before the main algorithm."},
      {q:"Object localization normally predicts a location in addition to a class.",answer:true,why:"A bounding box or similar spatial output indicates where the object appears."},
      {q:"Semantic segmentation assigns only one label to the entire image.",answer:false,why:"Semantic segmentation assigns a category to each pixel."},
      {q:"A video is a temporal sequence of image frames.",answer:true,why:"Motion and actions can be inferred from changes across the frame sequence."},
      {q:"Multi-object tracking attempts to preserve identities across frames.",answer:true,why:"Tracking associates observations over time to form trajectories."}
    ],
    problemTypes: [["p02","2. Image statistics and thresholding"],["p03","3. Bits, levels, and storage"]]
  },
  3: {
    short: "Linear Algebra",
    title: "Linear Algebra and Transformations",
    summary: "Use vectors and matrices to measure direction, construct geometry, and compose scaling, rotation, translation, affine, and perspective transformations.",
    image: "assets/ln3.png",
    objectives: [
      "Compute vector norms, dot products, angles, projections, and cross products.",
      "Multiply matrices and reason about dimensions, determinants, and inverses.",
      "Represent translation with homogeneous coordinates.",
      "Apply and compose 2D geometric transformations in the correct order."
    ],
    concepts: [
      ["Dot product", "The dot product measures directional agreement: positive for similar directions, zero for perpendicular vectors, and negative for opposing directions."],
      ["Cross product", "In three dimensions, a × b is perpendicular to both vectors. In homogeneous geometry, the same algebra constructs lines and intersections."],
      ["Matrix action", "A matrix maps vectors to new vectors. Its columns show where the coordinate basis vectors move."],
      ["Homogeneous coordinates", "Adding a coordinate lets translation join scaling and rotation inside one matrix product."],
      ["Composition order", "The rightmost matrix acts first. Matrix multiplication is generally not commutative, so changing order changes the result."],
      ["Affine and perspective maps", "Affine maps preserve parallelism. Perspective maps additionally model convergence and require division by the final homogeneous coordinate."],
    ],
    handsOn: [
      ["Calculate", "Solve one vector or transformation example by hand."],
      ["Visualize", "Plot the original and transformed vectors or points."],
      ["Implement", "Apply the same matrix with NumPy or OpenCV."],
      ["Compare", "Explain numerical, visual, and order-dependent differences."],
    ],
    notebooks: [
      ["Linear algebra and transformations", "Vectors, matrices, scaling, rotation, translation, affine, and perspective examples.", "LN3_Transformations.ipynb"],
      ["Homogeneous cross products", "Interactive points, lines, incidence tests, and intersections.", "Homogeneous_Cross_Product.ipynb"],
    ],
    mcqs: [
      {q:"Two nonzero vectors are perpendicular when their dot product is:", options:["1","0","Their largest component","Their combined norm"], answer:1, why:"For nonzero vectors, a · b = ||a||||b||cos θ, so a zero result means θ = 90°."},
      {q:"If A is 2 × 3 and B is 3 × 4, what is the shape of AB?", options:["2 × 4","3 × 3","4 × 2","Undefined"], answer:0, why:"The inner dimensions match, and the output keeps the outer dimensions."},
      {q:"Why does planar translation use a 3 × 3 homogeneous matrix?", options:["To make every vector unit length","To express translation as matrix multiplication","To remove the origin","To make multiplication commutative"], answer:1, why:"The added coordinate embeds affine translation in a linear operation in the augmented space."},
      {q:"Which property is preserved by an affine transformation?", options:["Every angle","Every length","Parallelism","Perspective depth"], answer:2, why:"Affine transformations preserve straightness and parallel lines, but not necessarily lengths or angles."},
      {q:"When applying H = TRS to a point, which transformation acts first?", options:["T","R","S","All simultaneously"], answer:2, why:"With column vectors, the rightmost matrix acts first."}
    ],
    trueFalse: [
      {q:"The L1 norm is the usual Euclidean length of a vector.",answer:false,why:"The L2 norm gives Euclidean length; the L1 norm sums absolute components."},
      {q:"If two nonzero vectors have a zero dot product, they are orthogonal.",answer:true,why:"A zero dot product corresponds to a 90-degree angle."},
      {q:"A nonzero cross product is perpendicular to both input vectors.",answer:true,why:"Orthogonality to both operands is a defining property of the 3D cross product."},
      {q:"Two matrices must have the same dimensions in order to be added.",answer:true,why:"Matrix addition operates entry by entry."},
      {q:"Matrix multiplication is commutative for all compatible matrices.",answer:false,why:"In general AB is not equal to BA, and one product may even be undefined."},
      {q:"A square matrix with determinant zero has an inverse.",answer:false,why:"A zero determinant means the matrix is singular."},
      {q:"Multiplication by the identity matrix leaves a compatible vector or matrix unchanged.",answer:true,why:"The identity matrix is the multiplicative identity."},
      {q:"A 2 × 2 linear transformation can move the origin to a nonzero point.",answer:false,why:"Every linear transformation maps the zero vector to itself; translation requires homogeneous coordinates."},
      {q:"Applying rotation and translation in opposite orders always gives the same result.",answer:false,why:"Transformation order matters because matrix multiplication is generally not commutative."},
      {q:"Affine transformations preserve parallel lines.",answer:true,why:"Parallelism is an affine invariant."}
    ],
    problemTypes: [
      ["p05","5. Vector magnitude, distance, and direction"],["p06","6. Dot product using cosine"],
      ["p07","7. Orthogonality and projection"],["p08","8. Three-dimensional cross product"],
      ["p09","9. Matrix dimensions and multiplication"],["p10","10. Determinant, inverse, and a linear system"],
      ["p11","11. Symmetric and skew-symmetric parts"],["p12","12. Images as arrays"],
      ["p21","21. Scaling and rotation"],["p22","22. Homogeneous translation"],
      ["p23","23. Transformation order"],["p24","24. Affine transformation of a triangle"],
      ["p25","25. Recover a simple affine map"]
    ]
  },
  4: {
    short: "Camera Models",
    title: "Camera Models and Projective Geometry",
    summary: "Connect 3D scene points to 2D pixels through pinhole projection, homogeneous lines, vanishing points, and camera parameters.",
    image: "assets/ln4.png",
    objectives: [
      "Project 3D camera-coordinate points onto an image plane.",
      "Explain how focal length and depth affect image position and size.",
      "Construct a line from two homogeneous points and an intersection from two lines.",
      "Distinguish intrinsic parameters, extrinsic parameters, and lens distortion."
    ],
    concepts: [
      ["Pinhole projection", "Image position depends on X/Z and Y/Z. Points on the same camera ray share a projection, so depth is lost."],
      ["Homogeneous incidence", "A point p lies on line l when lᵀp = 0. Cross products construct the vector satisfying two incidence constraints."],
      ["Vanishing points", "Parallel 3D lines can meet in the image because their shared direction projects to a point at infinity or a finite vanishing point."],
      ["Intrinsics", "Focal lengths, principal point, and skew describe how camera coordinates map to pixels."],
      ["Extrinsics", "Rotation and translation describe camera pose or the mapping from world coordinates to camera coordinates."],
      ["Lens effects", "Aperture controls light and depth of field; radial distortion bends image coordinates increasingly toward the edges."],
    ],
    handsOn: [
      ["Project", "Compute x=fX/Z and y=fY/Z for several 3D points."],
      ["Construct", "Use p₁ × p₂ for a line and l₁ × l₂ for an intersection."],
      ["Visualize", "Draw viewing rays, vanishing points, or depth-dependent image size."],
      ["Calibrate", "Interpret how K, R, t, and distortion change measured pixels."],
    ],
    notebooks: [
      ["Camera model and image formation", "Projection, depth, intrinsics, extrinsics, vanishing points, and radial distortion.", "LN4_Camera_Models.ipynb"],
      ["Homogeneous cross products", "Point-line duality and intersection visualizations.", "Homogeneous_Cross_Product.ipynb"],
    ],
    mcqs: [
      {q:"In a pinhole camera, increasing Z while X and Y stay fixed moves the projection:", options:["Farther from the principal point","Toward the principal point","To infinity","Without any change"], answer:1, why:"Because x and y contain division by Z, greater depth reduces displacement from the principal point."},
      {q:"The intersection of homogeneous lines l₁ and l₂ is:", options:["l₁ + l₂","l₁ · l₂","l₁ × l₂","l₁/l₂"], answer:2, why:"The cross product produces a point vector orthogonal to both line vectors and therefore satisfying both line equations."},
      {q:"What does homogeneous coordinate w=0 represent?", options:["The origin only","A point at infinity or direction","An invalid vector in every case","The principal point"], answer:1, why:"Points with w=0 represent directions and intersections of parallel lines in projective geometry."},
      {q:"Which is an intrinsic camera parameter?", options:["World position","Camera rotation","Focal length in pixels","Object velocity"], answer:2, why:"Focal length belongs to the internal camera calibration matrix."},
      {q:"Radial distortion is commonly most visible:", options:["Near image edges","Only at the center","Only in grayscale images","Only for distant objects"], answer:0, why:"Radial displacement generally grows with distance from the optical axis."}
    ],
    trueFalse: [
      {q:"A pinhole camera reduces blur by blocking most rays from reaching the image plane.",answer:true,why:"The aperture restricts the pencil of rays contributing to each image location."},
      {q:"Perspective projection uniquely preserves the depth of every 3D point.",answer:false,why:"Depth is lost because points on one viewing ray can share an image projection."},
      {q:"In perspective projection, image coordinates are inversely related to scene depth Z.",answer:true,why:"The projected coordinates contain the ratios X/Z and Y/Z."},
      {q:"Any two image lines that meet must correspond to parallel lines in the 3D world.",answer:false,why:"Converging image lines can arise from many 3D configurations."},
      {q:"The homogeneous points (x,y,w) and (kx,ky,kw), for nonzero k, represent the same point.",answer:true,why:"Homogeneous coordinates are defined only up to a nonzero scale."},
      {q:"A homogeneous point with w=0 represents a point at infinity.",answer:true,why:"Points with w=0 encode directions and parallel-line intersections."},
      {q:"Homogeneous coordinates allow translation to be written as matrix multiplication.",answer:true,why:"The added coordinate makes affine translation linear in the augmented space."},
      {q:"Camera position and orientation are intrinsic parameters.",answer:false,why:"Position and orientation are extrinsic; focal length and principal point are intrinsic."},
      {q:"A smaller aperture generally increases depth of field but reduces the amount of light entering the camera.",answer:true,why:"This is the central aperture tradeoff."},
      {q:"Radial distortion is usually strongest at the principal point and weakest near the image edges.",answer:false,why:"Radial distortion is generally more noticeable farther from the optical axis."}
    ],
    problemTypes: [
      ["p13","13. Point cross point gives a line"],["p14","14. Line through two points"],
      ["p15","15. Line-point incidence test"],["p16","16. Line cross line gives the intersection"],
      ["p17","17. Parallel lines and a point at infinity"],["p18","18. Equivalent homogeneous points"],
      ["p19","19. Why the cross product works"],["p20","20. Planes behind homogeneous line vectors"],
      ["p26","26. Perspective transform and homogeneous division"],["p27","27. Pinhole projection"],
      ["p28","28. Projection matrix with camera intrinsics"],["p29","29. Depth and magnification"],
      ["p30","30. Extrinsic translation before projection"]
    ]
  },
  5: {
    short: "Filtering",
    title: "Image Operations and Spatial Filtering",
    summary: "Calculate point operations and neighborhood filters, compare boundary conditions, test linearity, and connect derivatives to image edges.",
    image: "assets/ln5.png",
    objectives: [
      "Apply brightness, contrast, threshold, and grayscale point operations.",
      "Calculate valid and same-size correlation outputs by hand.",
      "Compare zero, replicate, symmetric, and circular padding.",
      "Explain Gaussian smoothing, median filtering, LSI systems, and derivative responses."
    ],
    concepts: [
      ["Point operations", "Each output pixel depends only on its corresponding input pixel. Examples include brightness, contrast, thresholding, and color conversion."],
      ["Spatial filtering", "A kernel combines a local neighborhood to produce one output value. The kernel determines smoothing, sharpening, shifting, or differentiation."],
      ["Correlation and convolution", "Correlation keeps the kernel orientation; convolution flips it before sliding. Symmetric kernels make both outputs identical."],
      ["Padding", "Boundary rules create missing neighbors. Zero, replicate, symmetric, and circular padding can produce very different corner values."],
      ["Linear shift invariance", "An LSI filter obeys superposition and responds to a shifted input with an equally shifted output."],
      ["Robust smoothing and edges", "Gaussian filters average with distance-based weights; median filters suppress isolated outliers; derivatives respond to intensity transitions."],
    ],
    handsOn: [
      ["Calculate", "Multiply a 3 × 3 patch and kernel element by element."],
      ["Compare", "Repeat the corner calculation under three boundary rules."],
      ["Verify", "Check the result with a short NumPy implementation."],
      ["Interpret", "Decide whether the response represents smoothing, an edge, or an outlier."],
    ],
    notebooks: [
      ["Image and filtering examples", "Complete LN5 notebook covering representation, noise, filters, padding, Gaussian kernels, median filters, and derivatives.", "LN5_Image_and_Filtering.ipynb"],
      ["LSI hands-on lab", "Impulse response, convolution, linearity, shift invariance, and median nonlinearity.", "LSI_Hands_On.ipynb"],
    ],
    mcqs: [
      {q:"What distinguishes filtering from point processing?", options:["Filtering uses a neighborhood","Filtering always uses RGB","Point processing requires a 7 × 7 kernel","Point processing is always nonlinear"], answer:0, why:"A spatial filter combines nearby pixels; a point operation maps each pixel independently."},
      {q:"For a 5 × 6 image and a 3 × 3 kernel, what is the valid output size?", options:["5 × 6","3 × 4","7 × 8","2 × 3"], answer:1, why:"Valid size is (5−3+1) × (6−3+1) = 3 × 4."},
      {q:"Which padding wraps the opposite edge into the neighborhood?", options:["Zero","Replicate","Circular","Valid"], answer:2, why:"Circular padding treats the image as periodic and wraps indices around."},
      {q:"Which filter is most robust to isolated salt-and-pepper outliers?", options:["Median","Identity","First derivative","Large positive gain"], answer:0, why:"The median depends on ordering rather than the magnitude of extreme values."},
      {q:"A first-derivative filter produces its strongest response in:", options:["Uniform regions","Strong intensity transitions","Every image corner only","Perfectly constant images"], answer:1, why:"Derivatives are near zero in constant regions and large where intensity changes rapidly."}
    ],
    trueFalse: [
      {q:"Sampling discretizes the spatial domain of an image.",answer:true,why:"Sampling selects discrete spatial positions from a continuous image function."},
      {q:"Quantization discretizes the range of possible intensity values.",answer:true,why:"Quantization maps measured values into a finite set."},
      {q:"The additive noise model can be written as I_observed = I_original + n.",answer:true,why:"The observed value equals the true value plus a noise term in the additive model."},
      {q:"Averaging multiple images of the same still scene can reduce independent random noise.",answer:true,why:"Random fluctuations tend to cancel while fixed scene content reinforces."},
      {q:"A spatial filter computes each output pixel using a neighborhood of input pixels.",answer:true,why:"The kernel defines how neighborhood values contribute to the output."},
      {q:"Cross-correlation flips the kernel in both spatial directions before applying it.",answer:false,why:"Convolution flips the kernel; cross-correlation retains its orientation."},
      {q:"Convolution is commutative: f*g = g*f.",answer:true,why:"Commutativity is a standard convolution property."},
      {q:"The median filter is a linear filter.",answer:false,why:"Median selection does not satisfy superposition."},
      {q:"A separable M × M filter can reduce filtering cost by using two one-dimensional passes.",answer:true,why:"The two-pass method reduces work per pixel from order M² to order M."},
      {q:"A first-derivative filter gives its largest response in perfectly uniform image regions.",answer:false,why:"Uniform regions have nearly zero derivative; strong transitions produce large responses."}
    ],
    problemTypes: [
      ["p31","31. Brightness, contrast, and clipping"],["p32","32. Histogram and threshold"],
      ["p33","33. RGB to grayscale point operation"],["p34","34. Valid 2D cross-correlation"],
      ["p35","35. Boundary handling: zero and replicate"],["p36","36. Cross-correlation versus convolution"],
      ["p37","37. Gaussian separability and cost"],["p38","38. Median filtering and nonlinearity"],
      ["p39","39. Impulse response and 2D linearity"],["p40","40. Horizontal and vertical derivatives"],
      ["p41","41. Mean filter with three padding modes"],["p42","42. Gaussian filter with three padding modes"],
      ["p43","43. Derivative filter with three padding modes"],["filter","Flexible filter lab"]
    ]
  }
};
