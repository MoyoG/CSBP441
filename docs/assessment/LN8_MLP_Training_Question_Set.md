# LN8 MLP Training Question Set

## Part A: Multiple Choice

1. In a 2–2–1 MLP, how many trainable parameters are there?
   - A. 5
   - B. 7
   - C. 9
   - D. 12

2. Which activation function is used for every neuron in this exercise?
   - A. ReLU
   - B. Sigmoid
   - C. Tanh
   - D. Softmax

3. The sigmoid function is:
   - A. \(\sigma(z)=\max(0,z)\)
   - B. \(\sigma(z)=1/(1+e^{-z})\)
   - C. \(\sigma(z)=z^2\)
   - D. \(\sigma(z)=e^z\)

4. For binary cross-entropy with a sigmoid output, the output error is:
   - A. \(\delta^o=\hat y+y\)
   - B. \(\delta^o=\hat y-y\)
   - C. \(\delta^o=y-\hat y\)
   - D. \(\delta^o=\hat y(1-\hat y)\)

5. A bias gradient for a neuron is:
   - A. Always zero
   - B. The neuron error
   - C. The input multiplied by the learning rate
   - D. The output probability

6. Which expression computes a hidden-neuron error?
   - A. \(\delta_h=\delta^o h(1-h)\)
   - B. \(\delta_h=\delta^o v h(1-h)\)
   - C. \(\delta_h=\hat y-y\)
   - D. \(\delta_h=w^Tx+b\)

7. The XOR target for input \((1,1)\) is:
   - A. 0
   - B. 1
   - C. 0.5
   - D. Depends on the weights

8. A sigmoid output is classified as class 1 when:
   - A. \(\hat y<0\)
   - B. \(\hat y\ge 0.5\)
   - C. \(\hat y=0\)
   - D. \(z^o<0\)

9. The gradient-descent update is:
   - A. \(\theta_{new}=\theta_{old}+\eta\nabla L\)
   - B. \(\theta_{new}=\theta_{old}-\eta\nabla L\)
   - C. \(\theta_{new}=\eta\theta_{old}\)
   - D. \(\theta_{new}=\theta_{old}/\eta\)

10. For a full-batch XOR update, gradients are:
   - A. Taken from only the first row
   - B. Averaged over the four XOR examples
   - C. Added without division
   - D. Computed only for the output bias

11. What is the derivative of the sigmoid when its output is (h=0.5)?
   - A. (0)
   - B. (0.25)
   - C. (0.5)
   - D. (1)

12. For (x=(0,1)), (w_{21}=0.20), and (b_1=-0.10), what is the hidden pre-activation (z_1)?
   - A. (-0.30)
   - B. (-0.10)
   - C. (0.10)
   - D. (0.30)

13. If the output pre-activation is (z^o=0), what is the sigmoid prediction?
   - A. (0)
   - B. (0.25)
   - C. (0.5)
   - D. (1)

14. For (y=1) and (hat y=0.80), what is the output error for sigmoid plus binary cross-entropy?
   - A. (0.80)
   - B. (0.20)
   - C. (-0.20)
   - D. (-0.80)

15. If an input value (x_i=0), what is the gradient of its connected weight for that training example?
   - A. Always (1)
   - B. Always equal to the learning rate
   - C. Zero
   - D. Equal to the output probability

16. Which expression correctly updates the output bias?
   - A. (b^o_{new}=b^o+etadelta^o)
   - B. (b^o_{new}=b^o-etadelta^o)
   - C. (b^o_{new}=eta b^o)
   - D. (b^o_{new}=b^o/eta)

17. If the gradient remains unchanged and the learning rate increases from (0.1) to (0.2), what happens to the update step?
   - A. It becomes half as large
   - B. It becomes twice as large
   - C. It becomes zero
   - D. It changes direction automatically

18. Which terms are needed to calculate a hidden-neuron error?
   - A. Only the target label
   - B. The output error, outgoing weight, and sigmoid derivative
   - C. Only the input value
   - D. Only the learning rate

19. Why are nonlinear hidden activations necessary for solving XOR?
   - A. They reduce the number of parameters to zero
   - B. They allow the network to represent nonlinear decision boundaries
   - C. They make XOR linearly separable
   - D. They remove the need for biases

20. What is approximately (sigma(-2))?
   - A. (0.119)
   - B. (0.269)
   - C. (0.500)
   - D. (0.881)

## Part B: True or False

1. A 2–2–1 MLP has two input neurons, two hidden neurons, and one output neuron.
2. The hidden-layer activations are computed before the output activation.
3. The sigmoid output is always interpreted as a class label rather than a probability.
4. The XOR function is linearly separable.
5. For binary cross-entropy with sigmoid, \(\delta^o=\hat y-y\).
6. A bias behaves like a weight connected to an input whose value is 1.
7. The hidden error depends on the outgoing weight from that hidden neuron.
8. A negative output error for a positive target means the predicted probability is too low.
9. The learning rate should be multiplied into the loss before backpropagation.
10. Updating weights requires recomputing the forward pass to see the new predictions.

11. The sigmoid derivative can be calculated from its output as (sigma'(z)=h(1-h)).
12. For a target (y=0), a positive output error (delta^o=hat y-y) means that the predicted probability is greater than zero.
13. If (x_i=0), the gradient of the weight connected to (x_i) is zero for that training example.
14. A bias can affect a neuron's activation even when all input values are zero.
15. For binary cross-entropy when (y=1), the loss is (L=-ln(hat y)).
16. If the learning rate is zero, the network parameters remain unchanged after the update.
17. A larger learning rate always guarantees faster and more stable convergence.
18. If the hidden-layer activation is linear, stacking multiple linear layers still produces an overall linear function.
19. If a hidden neuron has an outgoing weight of zero, its backpropagated error is zero.
20. For sigmoid output with binary cross-entropy, the output error is (delta^o=(hat y-y)hat y(1-hat y)).

## Part C: Problem Solving

### Problem 1: Forward Pass

Use the same 2–2–1 sigmoid MLP for the XOR input \(x=(0,1)\), with target \(y=1\). The weights and biases are editable.

| Parameter | Value |
|---|---:|
| \(w_{11}\) | 0.20 |
| \(w_{21}\) | 0.20 |
| \(b_1\) | −0.10 |
| \(w_{12}\) | −0.20 |
| \(w_{22}\) | −0.20 |
| \(b_2\) | 0.10 |
| \(v_1\) | 0.30 |
| \(v_2\) | 0.30 |
| \(b^o\) | −0.10 |

Calculate:

1. \(z_1,h_1,z_2,h_2\)
2. \(z^o\) and \(\hat y\)
3. The predicted class using a threshold of 0.5
4. The binary cross-entropy loss

Use:

\[
z_j=\sum_i w_{ij}x_i+b_j,\qquad h_j=\sigma(z_j)
\]

\[
z^o=v_1h_1+v_2h_2+b^o,\qquad \hat y=\sigma(z^o)
\]

### Problem 2: Backpropagation

Use the same network, input \(x=(0,1)\), target \(y=1\), and editable parameters from Problem 1. Let the learning rate be \(\eta=0.10\).

Calculate:

1. The output error \(\delta^o=\hat y-y\)
2. \(\partial L/\partial v_1,\partial L/\partial v_2,\partial L/\partial b^o\)
3. The hidden errors \(\delta_1,\delta_2\)
4. All six hidden-layer gradients
5. The updated values of all weights and biases

Use:

\[
\delta_j=\delta^o v_j h_j(1-h_j)
\]

\[
\frac{\partial L}{\partial v_j}=\delta^o h_j,\qquad
\frac{\partial L}{\partial w_{ij}}=\delta_jx_i,qquad
\frac{\partial L}{\partial b_j}=\delta_j
\]

\[
\theta_{new}=\theta_{old}-\eta\frac{\partial L}{\partial\theta}
\]

