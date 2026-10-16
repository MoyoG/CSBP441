# LN8 MLP Training Answer Key

## Multiple Choice

1. C  2. B  3. B  4. B  5. B  6. B  7. A  8. B  9. B  10. B

## True or False

1. True  2. True  3. False  4. False  5. True  6. True  7. True  8. True  9. False  10. True

## Problem 1

\[
z_1=0.10,\quad h_1=0.52498,\qquad z_2=-0.10,\quad h_2=0.47502
\]

\[
z^o=0.20,\quad \hat y=0.54983,\quad \hat c=1
\]

\[
L=-\ln(0.54983)\approx0.59814
\]

## Problem 2

\[
\delta^o=0.54983-1=-0.45017
\]

\[
\frac{\partial L}{\partial v_1}=-0.23642,\quad
\frac{\partial L}{\partial v_2}=-0.21391,\quad
\frac{\partial L}{\partial b^o}=-0.45017
\]

\[
\delta_1=\delta_2\approx-0.03371
\]

\[
\frac{\partial L}{\partial w_{11}}=0,\quad
\frac{\partial L}{\partial w_{21}}=-0.03371,\quad
\frac{\partial L}{\partial b_1}=-0.03371
\]

\[
\frac{\partial L}{\partial w_{12}}=0,\quad
\frac{\partial L}{\partial w_{22}}=-0.03371,\quad
\frac{\partial L}{\partial b_2}=-0.03371
\]

\[
v_1^{new}=0.32364,\quad v_2^{new}=0.32139,\quad b^{o,new}=-0.05498
\]

\[
w_{11}^{new}=0.20,\quad w_{21}^{new}=0.20337,\quad b_1^{new}=-0.09663
\]

\[
w_{12}^{new}=-0.20,\quad w_{22}^{new}=-0.19663,\quad b_2^{new}=0.10337
\]
