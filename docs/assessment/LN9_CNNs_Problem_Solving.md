# LN9 CNNs Problem Solving

1. **Output dimensions**. A 64×64×3 input is processed by 16 filters of size 5×5, stride 2, with no padding. Find the output height, width, and channels.
2. **Parameter count**. A convolution layer has 32 filters of size 3×3 and receives 16 input channels. Include one bias per filter. Find the trainable parameter count.
3. **Padding design**. Choose symmetric padding for a 7×7 filter with stride 1 so a 28×28 input keeps the same spatial size. Verify with the output formula.
4. **Stride comparison**. For a 32×32×3 input, 5×5 filters, and 8 output filters, compute the output volume for stride 1 and stride 3 with no padding. Explain what changes and what stays constant.
5. **AlexNet first layer**. Using 227×227×3 input, 96 filters of 11×11, stride 4, and no padding, calculate spatial output and weights plus biases.
6. **Pooling calculation**. Apply 2×2 max pooling with stride 2 to the matrix [1,5,2,4; 3,7,0,6; 8,2,9,1; 4,3,5,0]. Give the 2×2 output.
7. **Receptive field**. Two convolution layers use 3×3 filters, stride 1, and no pooling. What input-side receptive-field size does one second-layer activation see?
8. **Convolution response**. For image patch [1,2; 3,4] and filter [1,0; 0,-1], compute the valid cross-correlation response and interpret its sign.
9. **Architecture reasoning**. Explain why replacing a fully connected first layer on a 285×350×3 image with convolutional filters reduces parameters. Include local connectivity and weight sharing.
10. **Design choice**. A feature map is 32×32 and must become 16×16 while retaining its channels. Propose a pooling configuration and explain the effect on computation and spatial detail.
