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
      {q:"Which statement best describes a central goal of computer vision?",options:["Compress every image into the smallest file","Convert visual data into meaningful descriptions or decisions","Replace all cameras with depth sensors","Guarantee that every image has the same illumination"],answer:1,why:"Computer vision connects visual measurements such as pixels to useful meaning, descriptions, or actions."},
      {q:"What does the semantic gap describe?",options:["The difference between two camera focal lengths","The difference between training and testing accuracy","The difference between low-level visual data and high-level meaning","The physical space between two objects"],answer:2,why:"The semantic gap separates pixel-level representations from the concepts humans assign to a scene."},
      {q:"A camera moves around a stationary chair and almost every pixel changes. Which challenge does this illustrate?",options:["Occlusion","Viewpoint variation","Background clutter","Fine-grained recognition"],answer:1,why:"Viewpoint variation changes the projected appearance even though the object identity remains the same."},
      {q:"Images of dogs from many breeds, sizes, and poses belong to one class. This is an example of:",options:["Intraclass variation","Image quantization","Radial distortion","Binary segmentation"],answer:0,why:"Intraclass variation refers to appearance differences among examples of the same category."},
      {q:"Distinguishing a Maine Coon from a Ragdoll cat mainly illustrates which challenge?",options:["Image compression","Fine-grained categorization","Background subtraction","Camera calibration"],answer:1,why:"Fine-grained categorization separates visually similar subcategories within a broader class."},
      {q:"A partially hidden pedestrian is difficult to recognize primarily because of:",options:["Occlusion","Sampling","Magnification","Color quantization"],answer:0,why:"Occlusion hides part of the object and removes visual evidence needed for recognition."},
      {q:"Which combination most directly contributed to recent progress in computer vision?",options:["Smaller datasets and slower processors","Deep learning, large datasets, GPUs, and open-source frameworks","Eliminating mathematical models","Using only hand-drawn images"],answer:1,why:"Modern progress reflects improved learning methods, compute, data, reusable models, and software frameworks."},
      {q:"Which application estimates three-dimensional scene structure from images?",options:["Image classification","3D reconstruction","Style transfer","Binary thresholding"],answer:1,why:"3D reconstruction estimates scene geometry using one or more images."},
      {q:"Which task combines vision and language?",options:["Image captioning","Median filtering","Lens calibration","Histogram equalization"],answer:0,why:"Image captioning converts image content into a natural-language description."},
      {q:"What is the main lesson of unusual-object examples such as the Elephant in the Room demonstration?",options:["Modern detectors always interpret scenes like humans","High accuracy on common data does not guarantee robust understanding of unusual scenes","Object detection no longer requires data","Viewpoint variation has been completely solved"],answer:1,why:"A system can perform well on familiar benchmarks and still fail in unusual contexts or arrangements."}
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
      {q:"Which process converts a continuous scene into a digital image?",options:["Sampling and quantization","Rotation and translation","Detection and tracking","Training and validation"],answer:0,why:"Sampling discretizes spatial position, while quantization discretizes measured values."},
      {q:"What intensity range is normally available in an unsigned 8-bit grayscale image?",options:["0 to 1","0 to 7","0 to 255","-255 to 255"],answer:2,why:"Eight bits represent 256 values, conventionally numbered 0 through 255."},
      {q:"How is a standard RGB image represented?",options:["One binary channel","Three color channels","Two depth channels","A list of object names only"],answer:1,why:"RGB images store separate red, green, and blue channel values at each pixel."},
      {q:"Which retinal cells mainly support vision at low light levels and brightness perception?",options:["Cones","Rods","Pixels","Apertures"],answer:1,why:"Rods are highly light-sensitive and mainly support brightness and low-light vision."},
      {q:"Which ordering best represents a practical computer vision pipeline?",options:["Decision, input, preprocessing, algorithm","Input, preprocessing, algorithm, postprocessing, decision","Algorithm, camera, label, input","Postprocessing, decision, input, preprocessing"],answer:1,why:"A practical pipeline acquires data, prepares it, applies an algorithm, refines the result, and supports a decision."},
      {q:"When is a classical computer vision method especially attractive?",options:["When the visual rule is clear and interpretability matters","Only when unlimited labeled data are available","When intermediate results must remain hidden","Only for language generation"],answer:0,why:"Classical methods are often efficient and interpretable when the visual rule can be specified directly."},
      {q:"What is the typical output of image classification?",options:["A class label for the image","A trajectory for every object","A depth value for every pixel","A camera intrinsic matrix"],answer:0,why:"Image classification assigns one or more category labels to an image."},
      {q:"How does object localization extend image classification?",options:["It also estimates where the object is in the image","It removes all colors","It converts video into audio","It guarantees the object is moving"],answer:0,why:"Localization predicts both the object category and its image location, commonly with a bounding box."},
      {q:"Which task assigns a semantic category to each image pixel?",options:["Image classification","Semantic segmentation","Image captioning","Camera calibration"],answer:1,why:"Semantic segmentation produces a dense pixel-level class map."},
      {q:"Which task aims to maintain object identities and positions across video frames?",options:["Quantization","Tracking","Color conversion","Super-resolution"],answer:1,why:"Tracking links detections over time to estimate trajectories and preserve identity."}
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
      {q:"What is the Euclidean length of v=[-6,8]ᵀ?",options:["2","10","14","100"],answer:1,why:"The L2 norm is √((-6)²+8²)=√100=10."},
      {q:"Two nonzero vectors are orthogonal when:",options:["Their dot product is zero","Their cross product is zero","Their components are identical","Their L1 norms are equal"],answer:0,why:"A zero dot product means the cosine of their angle is zero, so the angle is 90 degrees."},
      {q:"The cross product a×b in three dimensions produces a vector that is:",options:["Parallel to both a and b","Perpendicular to both a and b","Always a unit vector","Equal to a+b"],answer:1,why:"The cross product is orthogonal to both inputs unless the result is the zero vector."},
      {q:"If A is 2×3 and B is 3×4, what is the size of AB?",options:["2×4","3×3","3×4","The product is undefined"],answer:0,why:"The inner dimensions match, and the output keeps the outer dimensions 2×4."},
      {q:"What does det(A)=0 imply for a square matrix A?",options:["A is an identity matrix","A has a unique inverse","A is singular","A preserves every length"],answer:2,why:"A zero determinant indicates collapsed dimension and no matrix inverse."},
      {q:"Why are homogeneous coordinates useful for planar translation?",options:["They allow translation to be represented by matrix multiplication","They remove the need for a coordinate system","They force all vectors to have unit length","They make matrix multiplication commutative"],answer:0,why:"Adding a homogeneous coordinate embeds translation into a larger linear matrix operation."},
      {q:"A 90-degree counterclockwise rotation maps the point (3,1) to:",options:["(1,3)","(-1,3)","(3,-1)","(-3,-1)"],answer:1,why:"The rotation rule (x,y)→(-y,x) gives (-1,3)."},
      {q:"Why can changing the order of geometric transformations change the final image?",options:["Matrix multiplication is generally not commutative","All transformations use different units","Rotation matrices cannot be multiplied","Homogeneous coordinates prohibit composition"],answer:0,why:"In general, AB and BA represent different transformation sequences and produce different results."},
      {q:"Which geometric property is preserved by an affine transformation?",options:["All lengths","All angles","Parallelism of lines","Perspective depth"],answer:2,why:"Affine transformations preserve straightness and parallelism, but not necessarily lengths or angles."},
      {q:"What is the minimum number of nondegenerate point correspondences required to estimate a planar perspective transform?",options:["Two","Three","Four","Eight"],answer:2,why:"A homography has eight independent scale-normalized parameters and requires four suitable point pairs."}
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
      {q:"What is the main purpose of the small opening in a pinhole camera?",options:["To block most rays and reduce image blur","To increase radial distortion","To convert RGB into grayscale","To make every object the same size"],answer:0,why:"Restricting the rays reaching each image point reduces the overlap that would otherwise blur the image."},
      {q:"Under the lecture's pinhole convention, a 3D point (X,Y,Z) projects to:",options:["(-fX/Z,-fY/Z)","(fX,fY)","(X+f,Y+f)","(X/Z²,Y/Z²)"],answer:0,why:"Under the stated sign convention, similar triangles give coordinates proportional to focal length and inversely proportional to depth."},
      {q:"Why is perspective projection not one-to-one?",options:["Different 3D points on the same viewing ray can project to the same image point","Every image point has a different color","The camera records only parallel rays","The focal length is always zero"],answer:0,why:"Projection loses depth along a viewing ray, so multiple scene points can share an image location."},
      {q:"A set of parallel 3D lines with the same direction generally projects to:",options:["Concentric circles","Lines meeting at a vanishing point","A single image pixel","Parallel image rows in every camera pose"],answer:1,why:"Parallel scene lines generally project to image lines meeting at a direction-dependent vanishing point."},
      {q:"Which homogeneous image points represent the same Cartesian point?",options:["(2,4,2) and (1,2,1)","(2,4,2) and (2,4,1)","(1,2,0) and (1,2,1)","(0,0,0) and (1,1,1)"],answer:0,why:"Nonzero homogeneous vectors that differ by a common scale represent the same point."},
      {q:"Given homogeneous line vectors l₁ and l₂, their intersection point is computed by:",options:["l₁+l₂","l₁·l₂","l₁×l₂","l₁/l₂"],answer:2,why:"The cross product produces a point vector satisfying both line equations."},
      {q:"Which item is an intrinsic camera parameter?",options:["Camera position in the world","Camera orientation in the world","Focal length","World-coordinate origin"],answer:2,why:"Focal length belongs to internal calibration; position and orientation are extrinsic parameters."},
      {q:"What usually happens when the aperture becomes smaller?",options:["More light enters and depth of field decreases","Less light enters and depth of field increases","Focal length becomes zero","Radial distortion always disappears"],answer:1,why:"A smaller aperture admits less light but increases the range of depths that appear acceptably focused."},
      {q:"Where is radial lens distortion usually most noticeable?",options:["Near the optical axis only","Near the image edges","Only at the principal point","Equally at every pixel"],answer:1,why:"Radial distortion generally increases with distance from the optical axis."},
      {q:"For a fixed sensor size, which change generally gives a wider field of view?",options:["Increasing focal length","Decreasing focal length","Increasing object depth only","Changing image brightness"],answer:1,why:"A shorter focal length captures a wider angular field of view."}
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
      {q:"Which statement correctly distinguishes sampling from quantization?",options:["Sampling discretizes position; quantization discretizes intensity","Sampling discretizes intensity; quantization discretizes position","Both operations only change color","Neither operation is part of digitization"],answer:0,why:"Sampling acts on the spatial domain, while quantization acts on the value range."},
      {q:"Which noise model randomly replaces some pixels with very dark or very bright values?",options:["Gaussian noise","Salt-and-pepper noise","Radial distortion","Perspective noise"],answer:1,why:"Salt-and-pepper noise produces sparse black and white outliers."},
      {q:"What characterizes a point-processing operation?",options:["Each output pixel depends only on the corresponding input pixel","Each output pixel requires the entire video","It always uses a 7×7 kernel","It must be nonlinear"],answer:0,why:"Point processing maps each intensity independently and does not inspect neighboring pixels."},
      {q:"What distinguishes image filtering from point processing?",options:["Filtering combines values from a local neighborhood","Filtering cannot change an image","Filtering operates only on text","Filtering always produces a binary image"],answer:0,why:"A spatial filter computes each output from a neighborhood around the current position."},
      {q:"A 3-sample averaging filter is applied to [9,10,12]. What is the output?",options:["9.00","10.00","10.33","12.00"],answer:2,why:"The average is (9+10+12)/3=31/3=10.33."},
      {q:"With no padding, what is the valid output size when a 3×3 kernel is applied to a 5×6 image?",options:["5×6","3×4","7×8","2×3"],answer:1,why:"Valid filtering gives (5−3+1)×(6−3+1)=3×4."},
      {q:"How does convolution differ from cross-correlation?",options:["Convolution flips the kernel before sliding it","Cross-correlation always uses a median","Convolution cannot use padding","Cross-correlation is always nonlinear"],answer:0,why:"Cross-correlation keeps the kernel orientation, whereas convolution reverses it in each spatial dimension."},
      {q:"Which two properties define an LSI system?",options:["Linearity and shift invariance","Brightness and contrast","Sampling and quantization","Rotation and scaling"],answer:0,why:"An LSI system obeys superposition and responds identically to the same pattern at shifted locations."},
      {q:"A practical Gaussian kernel width is commonly chosen to cover approximately:",options:["One standard deviation","Two standard deviations total","Six standard deviations total","The image width regardless of sigma"],answer:2,why:"A width near 6σ captures about 99.7 percent of the Gaussian distribution."},
      {q:"Which filter is usually most robust to isolated salt-and-pepper outliers?",options:["Median filter","Large positive gain","Identity filter","First derivative only"],answer:0,why:"The median depends on order rather than the magnitude of extreme values."}
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
